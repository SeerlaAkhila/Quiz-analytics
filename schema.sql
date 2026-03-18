-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS QuizAttempts;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Topics;
DROP TABLE IF EXISTS Questions;

-- Topics table to categorize subjects
CREATE TABLE Topics (
    topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_name TEXT NOT NULL,
    category TEXT NOT NULL
);

-- Questions table with all quiz data
CREATE TABLE Questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    question_text TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT NOT NULL,
    option4 TEXT NOT NULL,
    correct_option INTEGER NOT NULL, -- 1, 2, 3, or 4
    explanation TEXT,
    FOREIGN KEY (topic_id) REFERENCES Topics (topic_id)
);

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE QuizAttempts (
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

-- --- Insert Sample Data ---

-- Python Basics Topic
INSERT INTO Topics (topic_name, category) VALUES ('Python Basics', 'Programming');
-- Beginner Questions (Topic 1)
INSERT INTO Questions (topic_id, difficulty, question_text, option1, option2, option3, option4, correct_option, explanation) VALUES
(1, 'Beginner', 'What will `print("Hello"[1])` output?', 'H', 'e', 'l', 'o', 2, 'String indexing in Python starts at 0. So, the character at index 1 is "e".'),
(1, 'Beginner', 'Which of the following is used to create a single-line comment in Python?', '#', '//', '/*', '--', 1, 'In Python, the # symbol is used to start a single-line comment.'),
(1, 'Beginner', 'What is the result of `3 * "a"` in Python?', 'aaa', 'a3', 'Error', '3a', 1, 'The * operator with a string and an integer performs string repetition.');

-- Intermediate Questions (Topic 1)
INSERT INTO Questions (topic_id, difficulty, question_text, option1, option2, option3, option4, correct_option, explanation) VALUES
(1, 'Intermediate', 'What does the `range(1, 4)` function generate?', '[1, 2, 3, 4]', '[1, 2, 3]', '[2, 3, 4]', '[2, 3]', 2, '`range(start, stop)` generates numbers from `start` up to, but not including, `stop`.'),
(1, 'Intermediate', 'How do you get the number of items in a list named `my_list`?', 'my_list.size()', 'len(my_list)', 'my_list.length()', 'count(my_list)', 2, 'The built-in `len()` function is used to get the number of items in a list or any other sequence.'),
(1, 'Intermediate', 'What will be the value of `my_list` after `my_list = [1, 2, 3]; my_list.append(4)`?', '[1, 2, 3]', '[4, 1, 2, 3]', '[1, 2, 3, 4]', '[1, 4, 2, 3]', 3, 'The `append()` method adds an element to the end of the list.');

-- Advanced Questions (Topic 1)
INSERT INTO Questions (topic_id, difficulty, question_text, option1, option2, option3, option4, correct_option, explanation) VALUES
(1, 'Advanced', 'What is the output of `[x*2 for x in range(3)]`?', '[0, 2, 4]', '[1, 2, 3]', '[2, 4, 6]', '[0, 1, 2]', 1, 'This is a list comprehension. It creates a new list by doubling each item in `range(3)`, which is 0, 1, and 2.'),
(1, 'Advanced', 'How do you access the value associated with the key `"name"` in a dictionary `d`?', 'd.get("name")', 'd["name"]', 'Both A and B', 'd.value("name")', 3, 'Both `d["name"]` and `d.get("name")` can be used. `d.get()` is safer as it returns `None` if the key does not exist, whereas `d[]` will raise a KeyError.'),
(1, 'Advanced', 'What does the `pass` statement do in Python?', 'Exits the program', 'Skips the current loop iteration', 'Acts as a placeholder', 'Raises an exception', 3, 'The `pass` statement is a null operation; nothing happens when it executes. It is useful as a placeholder when a statement is required syntactically but no code needs to be executed.');

-- SQL Basics Topic
INSERT INTO Topics (topic_name, category) VALUES ('SQL Basics', 'Databases');
-- Beginner Questions (Topic 2)
INSERT INTO Questions (topic_id, difficulty, question_text, option1, option2, option3, option4, correct_option, explanation) VALUES
(2, 'Beginner', 'Which SQL statement is used to extract data from a database?', 'SELECT', 'GET', 'EXTRACT', 'OPEN', 1, 'The `SELECT` statement is used to query the database and retrieve data that matches criteria that you specify.'),
(2, 'Beginner', 'Which clause is used to filter records in a `SELECT` statement?', 'FILTER', 'WHERE', 'SORT', 'CONDITION', 2, 'The `WHERE` clause is used to filter records and extract only those that fulfill a specified condition.');

