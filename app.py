from functools import wraps
import os

from flask import Flask, jsonify, render_template, request, session
from werkzeug.security import check_password_hash, generate_password_hash

import database


DATABASE = "quiz.db"
DIFFICULTIES = ("Beginner", "Intermediate", "Advanced")

app = Flask(__name__)
app.config.from_mapping(
    DATABASE=DATABASE,
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", "dev-secret-key"),
)
database.init_app(app)


def query_db(query, args=(), one=False):
    """Query the database and optionally return a single row."""
    cur = database.get_db().execute(query, args)
    rows = cur.fetchall()
    cur.close()
    return (rows[0] if rows else None) if one else rows


def execute_db(query, args=()):
    """Execute a write query and commit the transaction."""
    db = database.get_db()
    cur = db.execute(query, args)
    db.commit()
    return cur


def ensure_auth_tables():
    """Create authentication and attempt history tables when missing."""
    db = database.get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS QuizAttempts (
            attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            topic_id INTEGER NOT NULL,
            overall_score INTEGER NOT NULL,
            beginner_score INTEGER NOT NULL,
            intermediate_score INTEGER NOT NULL,
            advanced_score INTEGER NOT NULL,
            questions_answered INTEGER NOT NULL,
            best_streak INTEGER NOT NULL,
            highest_level TEXT NOT NULL CHECK(highest_level IN ('Beginner', 'Intermediate', 'Advanced')),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users (user_id),
            FOREIGN KEY (topic_id) REFERENCES Topics (topic_id)
        );

        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_created
        ON QuizAttempts (user_id, created_at DESC);
        """
    )
    db.commit()


def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return query_db(
        "SELECT user_id, username, created_at FROM Users WHERE user_id = ?",
        [user_id],
        one=True,
    )


def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        user = current_user()
        if user is None:
            return jsonify({"error": "Authentication required"}), 401
        return view(user, *args, **kwargs)

    return wrapped_view


def serialize_user(user):
    if user is None:
        return None
    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "created_at": user["created_at"],
    }


@app.before_request
def bootstrap_tables():
    ensure_auth_tables()


@app.route("/api/session")
def get_session_state():
    return jsonify({"user": serialize_user(current_user())})


@app.route("/api/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters long."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    existing_user = query_db(
        "SELECT user_id FROM Users WHERE lower(username) = lower(?)",
        [username],
        one=True,
    )
    if existing_user is not None:
        return jsonify({"error": "That username is already taken."}), 409

    cursor = execute_db(
        "INSERT INTO Users (username, password_hash) VALUES (?, ?)",
        [username, generate_password_hash(password)],
    )
    session.clear()
    session["user_id"] = cursor.lastrowid

    user = current_user()
    return jsonify({"message": "Account created.", "user": serialize_user(user)}), 201


@app.route("/api/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    user = query_db(
        "SELECT user_id, username, password_hash, created_at FROM Users WHERE lower(username) = lower(?)",
        [username],
        one=True,
    )
    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid username or password."}), 401

    session.clear()
    session["user_id"] = user["user_id"]
    return jsonify(
        {
            "message": "Signed in successfully.",
            "user": {
                "user_id": user["user_id"],
                "username": user["username"],
                "created_at": user["created_at"],
            },
        }
    )


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Signed out."})


@app.route("/api/topics")
def get_topics():
    """Return available quiz topics with question counts per difficulty."""
    topics = query_db(
        """
        SELECT
            t.topic_id,
            t.topic_name,
            t.category,
            COUNT(q.question_id) AS total_questions,
            SUM(CASE WHEN q.difficulty = 'Beginner' THEN 1 ELSE 0 END) AS beginner_count,
            SUM(CASE WHEN q.difficulty = 'Intermediate' THEN 1 ELSE 0 END) AS intermediate_count,
            SUM(CASE WHEN q.difficulty = 'Advanced' THEN 1 ELSE 0 END) AS advanced_count
        FROM Topics t
        LEFT JOIN Questions q ON q.topic_id = t.topic_id
        GROUP BY t.topic_id, t.topic_name, t.category
        ORDER BY t.category, t.topic_name
        """
    )

    grouped_topics = {}
    for topic in topics:
        category = topic["category"]
        grouped_topics.setdefault(category, []).append(
            {
                "topic_id": topic["topic_id"],
                "topic_name": topic["topic_name"],
                "category": category,
                "question_count": topic["total_questions"],
                "difficulty_counts": {
                    "Beginner": topic["beginner_count"] or 0,
                    "Intermediate": topic["intermediate_count"] or 0,
                    "Advanced": topic["advanced_count"] or 0,
                },
            }
        )

    payload = [
        {"category": category, "topics": items}
        for category, items in grouped_topics.items()
    ]
    return jsonify(payload)


@app.route("/api/questions/<int:topic_id>")
@login_required
def get_questions(user, topic_id):
    """Return one topic with all of its questions grouped by difficulty."""
    topic = query_db(
        "SELECT topic_id, topic_name, category FROM Topics WHERE topic_id = ?",
        [topic_id],
        one=True,
    )
    if topic is None:
        return jsonify({"error": "Topic not found"}), 404

    rows = query_db(
        """
        SELECT question_id, difficulty, question_text, option1, option2, option3, option4,
               correct_option, explanation
        FROM Questions
        WHERE topic_id = ?
        ORDER BY question_id
        """,
        [topic_id],
    )

    grouped_questions = {difficulty: [] for difficulty in DIFFICULTIES}
    for row in rows:
        grouped_questions[row["difficulty"]].append(
            {
                "question_id": row["question_id"],
                "difficulty": row["difficulty"],
                "question_text": row["question_text"],
                "options": [
                    row["option1"],
                    row["option2"],
                    row["option3"],
                    row["option4"],
                ],
                "correct_option": row["correct_option"],
                "explanation": row["explanation"],
            }
        )

    return jsonify(
        {
            "topic": {
                "topic_id": topic["topic_id"],
                "topic_name": topic["topic_name"],
                "category": topic["category"],
            },
            "question_counts": {
                difficulty: len(grouped_questions[difficulty])
                for difficulty in DIFFICULTIES
            },
            "questions": grouped_questions,
        }
    )


@app.route("/api/attempts", methods=["GET"])
@login_required
def get_attempts(user):
    attempts = query_db(
        """
        SELECT
            a.attempt_id,
            a.overall_score,
            a.beginner_score,
            a.intermediate_score,
            a.advanced_score,
            a.questions_answered,
            a.best_streak,
            a.highest_level,
            a.created_at,
            t.topic_name,
            t.category
        FROM QuizAttempts a
        JOIN Topics t ON t.topic_id = a.topic_id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC, a.attempt_id DESC
        LIMIT 10
        """,
        [user["user_id"]],
    )

    return jsonify(
        {
            "attempts": [
                {
                    "attempt_id": attempt["attempt_id"],
                    "topic_name": attempt["topic_name"],
                    "category": attempt["category"],
                    "overall_score": attempt["overall_score"],
                    "beginner_score": attempt["beginner_score"],
                    "intermediate_score": attempt["intermediate_score"],
                    "advanced_score": attempt["advanced_score"],
                    "questions_answered": attempt["questions_answered"],
                    "best_streak": attempt["best_streak"],
                    "highest_level": attempt["highest_level"],
                    "created_at": attempt["created_at"],
                }
                for attempt in attempts
            ]
        }
    )


@app.route("/api/attempts", methods=["POST"])
@login_required
def save_attempt(user):
    payload = request.get_json(silent=True) or {}

    topic_id = payload.get("topic_id")
    overall_score = payload.get("overall_score")
    beginner_score = payload.get("beginner_score")
    intermediate_score = payload.get("intermediate_score")
    advanced_score = payload.get("advanced_score")
    questions_answered = payload.get("questions_answered")
    best_streak = payload.get("best_streak")
    highest_level = payload.get("highest_level")

    if highest_level not in DIFFICULTIES:
        return jsonify({"error": "Invalid highest level."}), 400

    topic = query_db("SELECT topic_id FROM Topics WHERE topic_id = ?", [topic_id], one=True)
    if topic is None:
        return jsonify({"error": "Topic not found."}), 404

    execute_db(
        """
        INSERT INTO QuizAttempts (
            user_id, topic_id, overall_score, beginner_score, intermediate_score,
            advanced_score, questions_answered, best_streak, highest_level
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            user["user_id"],
            topic_id,
            int(overall_score),
            int(beginner_score),
            int(intermediate_score),
            int(advanced_score),
            int(questions_answered),
            int(best_streak),
            highest_level,
        ],
    )

    return jsonify({"message": "Attempt saved."}), 201


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
