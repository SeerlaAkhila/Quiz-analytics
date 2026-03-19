document.addEventListener("DOMContentLoaded", () => {
    const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
    const LEVEL_UP_THRESHOLD = 2;
    const LEVEL_DOWN_THRESHOLD = 2;

    const authScreen = document.getElementById("auth-screen");
    const appShell = document.getElementById("app-shell");
    const topicSelectionView = document.getElementById("topic-selection-view");
    const quizView = document.getElementById("quiz-view");
    const summaryView = document.getElementById("summary-view");
    const topicSelect = document.getElementById("topic-select");
    const startQuizBtn = document.getElementById("start-quiz-btn");
    const selectedTopicName = document.getElementById("selected-topic-name");
    const selectedTopicCategory = document.getElementById("selected-topic-category");
    const topicTotalCount = document.getElementById("topic-total-count");
    const topicBeginnerCount = document.getElementById("topic-beginner-count");
    const topicIntermediateCount = document.getElementById("topic-intermediate-count");
    const topicAdvancedCount = document.getElementById("topic-advanced-count");
    const quizTopicTitle = document.getElementById("quiz-topic-title");
    const questionDifficulty = document.getElementById("question-difficulty");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const feedbackContainer = document.getElementById("feedback-container");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackText = document.getElementById("feedback-text");
    const progressText = document.getElementById("progress-text");
    const progressBarInner = document.getElementById("progress-bar-inner");
    const accuracyPill = document.getElementById("accuracy-pill");
    const streakPill = document.getElementById("streak-pill");
    const quizBestStreakPill = document.getElementById("quiz-best-streak-pill");
    const nextQuestionBtn = document.getElementById("next-question-btn");
    const restartBtn = document.getElementById("restart-btn");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const logoutBtn = document.getElementById("logout-btn");
    const dashboardLogoutBtn = document.getElementById("dashboard-logout-btn");
    const authForms = document.getElementById("auth-forms");
    const authActions = document.getElementById("auth-actions");
    const authStatus = document.getElementById("auth-status");
    const authMessage = document.getElementById("auth-message");
    const userBadge = document.getElementById("user-badge");
    const dashboardUserBadge = document.getElementById("dashboard-user-badge");
    const attemptList = document.getElementById("attempt-list");
    const historyEmpty = document.getElementById("history-empty");
    const leaderboardList = document.getElementById("leaderboard-list");
    const leaderboardEmpty = document.getElementById("leaderboard-empty");
    const summarySaveStatus = document.getElementById("summary-save-status");
    const reviewList = document.getElementById("review-list");
    const currentLoginStreak = document.getElementById("current-login-streak");
    const bestLoginStreak = document.getElementById("best-login-streak");
    const bestAnswerStreak = document.getElementById("best-answer-streak");
    const averageScoreStreak = document.getElementById("average-score-streak");

    let topics = [];
    let selectedTopic = null;
    let questionBank = {};
    let currentQuestion = null;
    let currentDifficulty = "Beginner";
    let questionsAsked = 0;
    let totalQuestions = 0;
    let correctStreak = 0;
    let incorrectStreak = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let highestLevelReached = "Beginner";
    let quizFinished = false;
    let currentUser = null;
    let history = {};
    let answerLog = [];

    function createEmptyHistory() {
        return {
            Beginner: { correct: 0, total: 0 },
            Intermediate: { correct: 0, total: 0 },
            Advanced: { correct: 0, total: 0 },
        };
    }

    function switchView(viewToShow) {
        document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
        viewToShow.classList.add("active");
    }

    function shuffle(items) {
        const copy = [...items];
        for (let index = copy.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
        }
        return copy;
    }

    function getDifficultyIndex(level) {
        return DIFFICULTIES.indexOf(level);
    }

    function getCorrectTotal() {
        return Object.values(history).reduce((sum, item) => sum + item.correct, 0);
    }

    function getAnsweredTotal() {
        return Object.values(history).reduce((sum, item) => sum + item.total, 0);
    }

    function calculatePercent(correct, total) {
        return Math.round((correct / total) * 100) || 0;
    }

    function formatScore(correct, total) {
        return `${calculatePercent(correct, total)}%`;
    }

    function formatDate(dateText) {
        const date = new Date(dateText);
        if (Number.isNaN(date.getTime())) {
            return "Recently";
        }
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }

    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.classList.remove("hidden", "error");
        if (isError) {
            element.classList.add("error");
        }
    }

    function hideMessage(element) {
        element.textContent = "";
        element.classList.add("hidden");
        element.classList.remove("error");
    }

    function setStreakDashboard(streaks = {}) {
        currentLoginStreak.textContent = streaks.login_streak ?? (currentUser?.login_streak ?? 1);
        bestLoginStreak.textContent = streaks.max_login_streak ?? (currentUser?.max_login_streak ?? 1);
        bestAnswerStreak.textContent = streaks.longest_answer_streak ?? 0;
        averageScoreStreak.textContent = `${streaks.average_score ?? 0}%`;
    }

    function setAppMode() {
        if (currentUser) {
            authScreen.classList.add("hidden");
            appShell.classList.remove("hidden");
            authForms.classList.add("hidden");
            authActions.classList.add("hidden");
            authStatus.textContent = `Signed in as ${currentUser.username}.`;
            userBadge.textContent = currentUser.username;
            dashboardUserBadge.textContent = currentUser.username;
            setStreakDashboard({
                login_streak: currentUser.login_streak,
                max_login_streak: currentUser.max_login_streak,
            });
        } else {
            appShell.classList.add("hidden");
            authScreen.classList.remove("hidden");
            authForms.classList.remove("hidden");
            authActions.classList.add("hidden");
            authStatus.textContent = "Login to continue to your quiz dashboard.";
            userBadge.textContent = "";
            dashboardUserBadge.textContent = "";
            setStreakDashboard();
            switchView(topicSelectionView);
        }

        startQuizBtn.disabled = !(currentUser && selectedTopic);
    }

    function updateTopicPreview(topic) {
        if (!topic) {
            selectedTopicName.textContent = "Choose a subject";
            selectedTopicCategory.textContent = "Your session details will appear here.";
            topicTotalCount.textContent = "0";
            topicBeginnerCount.textContent = "0";
            topicIntermediateCount.textContent = "0";
            topicAdvancedCount.textContent = "0";
            return;
        }

        selectedTopicName.textContent = topic.topic_name;
        selectedTopicCategory.textContent = `${topic.category} category`;
        topicTotalCount.textContent = topic.question_count;
        topicBeginnerCount.textContent = topic.difficulty_counts.Beginner;
        topicIntermediateCount.textContent = topic.difficulty_counts.Intermediate;
        topicAdvancedCount.textContent = topic.difficulty_counts.Advanced;
    }

    function populateTopics() {
        topicSelect.innerHTML = '<option value="">Select a subject</option>';
        topics.forEach((group) => {
            const optgroup = document.createElement("optgroup");
            optgroup.label = group.category;

            group.topics.forEach((topic) => {
                const option = document.createElement("option");
                option.value = topic.topic_id;
                option.textContent = `${topic.topic_name} (${topic.question_count})`;
                optgroup.appendChild(option);
            });

            topicSelect.appendChild(optgroup);
        });
    }

    function findSelectedTopic(topicId) {
        for (const group of topics) {
            const match = group.topics.find((topic) => String(topic.topic_id) === String(topicId));
            if (match) {
                return match;
            }
        }
        return null;
    }

    async function fetchTopics() {
        try {
            const response = await fetch("/api/topics");
            if (!response.ok) {
                throw new Error("Unable to load topics");
            }
            topics = await response.json();
            populateTopics();
        } catch (error) {
            console.error(error);
            topicSelect.innerHTML = '<option value="">Unable to load topics</option>';
            selectedTopicCategory.textContent = "Refresh the page and try again.";
        }
    }

    async function fetchSession() {
        try {
            const response = await fetch("/api/session");
            const payload = await response.json();
            currentUser = payload.user;
            setAppMode();
            if (currentUser) {
                await fetchAttempts();
            } else {
                renderAttempts([]);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchAttempts() {
        if (!currentUser) {
            renderAttempts([]);
            setStreakDashboard();
            return;
        }

        try {
            const response = await fetch("/api/attempts");
            if (response.status === 401) {
                currentUser = null;
                setAppMode();
                renderAttempts([]);
                return;
            }
            if (!response.ok) {
                throw new Error("Unable to load attempts");
            }

            const payload = await response.json();
            renderAttempts(payload.attempts || []);
            setStreakDashboard(payload.streaks || {});
        } catch (error) {
            console.error(error);
            renderAttempts([]);
        }
    }

    async function fetchLeaderboard() {
        try {
            const response = await fetch("/api/leaderboard");
            if (!response.ok) {
                throw new Error("Unable to load leaderboard");
            }
            const payload = await response.json();
            renderLeaderboard(payload.leaderboard || []);
        } catch (error) {
            console.error(error);
            renderLeaderboard([]);
        }
    }

    function renderAttempts(attempts) {
        attemptList.innerHTML = "";

        if (!currentUser || !attempts.length) {
            historyEmpty.classList.remove("hidden");
            historyEmpty.textContent = currentUser
                ? "Finish a quiz to start building your history."
                : "Login to see your recent quiz attempts here.";
            return;
        }

        historyEmpty.classList.add("hidden");
        attempts.forEach((attempt) => {
            const card = document.createElement("article");
            card.className = "attempt-card";
            card.innerHTML = `
                <h4>${attempt.topic_name}</h4>
                <p>${attempt.category} | ${formatDate(attempt.created_at)}</p>
                <div class="attempt-meta">
                    <div><span>Overall</span><strong>${attempt.overall_score}%</strong></div>
                    <div><span>Questions</span><strong>${attempt.questions_answered}</strong></div>
                    <div><span>Best Streak</span><strong>${attempt.best_streak}</strong></div>
                    <div><span>Highest Level</span><strong>${attempt.highest_level}</strong></div>
                </div>
            `;
            attemptList.appendChild(card);
        });
    }

    function renderLeaderboard(entries) {
        leaderboardList.innerHTML = "";

        if (!entries.length) {
            leaderboardEmpty.classList.remove("hidden");
            return;
        }

        leaderboardEmpty.classList.add("hidden");
        entries.forEach((entry) => {
            const row = document.createElement("article");
            row.className = "leaderboard-row";
            row.innerHTML = `
                <div class="leaderboard-top">
                    <div>
                        <div class="leaderboard-name">${entry.username}</div>
                        <p>Avg ${entry.average_score}% | Best ${entry.best_score}%</p>
                    </div>
                    <span class="leaderboard-rank">#${entry.rank}</span>
                </div>
                <div class="leaderboard-meta">
                    <div><span>Answer Streak</span><strong>${entry.best_streak}</strong></div>
                    <div><span>Attempts</span><strong>${entry.attempts}</strong></div>
                    <div><span>Login Streak</span><strong>${entry.max_login_streak}</strong></div>
                    <div><span>Momentum</span><strong>${entry.average_score + entry.best_streak}</strong></div>
                </div>
            `;
            leaderboardList.appendChild(row);
        });
    }

    function updateProgress() {
        const answeredCount = getAnsweredTotal();
        const accuracy = answeredCount ? calculatePercent(getCorrectTotal(), answeredCount) : 0;
        const progressPercentage = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0;

        progressBarInner.style.width = `${progressPercentage}%`;
        progressText.textContent = `Question ${Math.min(answeredCount + 1, totalQuestions || 1)} of ${totalQuestions || 0}`;
        accuracyPill.textContent = `${accuracy}%`;
        streakPill.textContent = `${currentStreak}`;
        quizBestStreakPill.textContent = `${bestStreak}`;
    }

    function resetQuestionUI() {
        optionsContainer.innerHTML = "";
        feedbackContainer.className = "feedback-container";
        feedbackContainer.style.display = "none";
        feedbackTitle.textContent = "";
        feedbackText.textContent = "";
        nextQuestionBtn.style.display = "none";
    }

    function renderQuestion(question) {
        resetQuestionUI();
        questionDifficulty.textContent = question.difficulty;
        questionText.textContent = question.question_text;

        question.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "option-btn";
            button.dataset.option = index + 1;
            button.textContent = option;
            button.addEventListener("click", () => handleAnswer(index + 1));
            optionsContainer.appendChild(button);
        });

        updateProgress();
    }

    function getNextAvailableDifficulty(preferredDifficulty) {
        const preferredIndex = getDifficultyIndex(preferredDifficulty);
        const order = [preferredIndex, preferredIndex + 1, preferredIndex - 1, preferredIndex + 2, preferredIndex - 2];

        for (const index of order) {
            const difficulty = DIFFICULTIES[index];
            if (difficulty && questionBank[difficulty] && questionBank[difficulty].length > 0) {
                return difficulty;
            }
        }

        return null;
    }

    function loadNextQuestion() {
        if (quizFinished) {
            return;
        }

        const nextDifficulty = getNextAvailableDifficulty(currentDifficulty);
        if (!nextDifficulty) {
            showSummary();
            return;
        }

        currentDifficulty = nextDifficulty;
        highestLevelReached =
            getDifficultyIndex(currentDifficulty) > getDifficultyIndex(highestLevelReached)
                ? currentDifficulty
                : highestLevelReached;

        currentQuestion = questionBank[currentDifficulty].shift();
        renderQuestion(currentQuestion);
    }

    function updateDifficultyAfterAnswer(isCorrect) {
        if (isCorrect) {
            correctStreak += 1;
            incorrectStreak = 0;
            if (correctStreak >= LEVEL_UP_THRESHOLD) {
                const nextIndex = Math.min(getDifficultyIndex(currentDifficulty) + 1, DIFFICULTIES.length - 1);
                currentDifficulty = DIFFICULTIES[nextIndex];
                correctStreak = 0;
            }
        } else {
            incorrectStreak += 1;
            correctStreak = 0;
            if (incorrectStreak >= LEVEL_DOWN_THRESHOLD) {
                const nextIndex = Math.max(getDifficultyIndex(currentDifficulty) - 1, 0);
                currentDifficulty = DIFFICULTIES[nextIndex];
                incorrectStreak = 0;
            }
        }
    }

    function logAnswer(question, selectedOption, isCorrect) {
        answerLog.push({
            difficulty: question.difficulty,
            question_text: question.question_text,
            selected_text: question.options[selectedOption - 1],
            correct_text: question.options[question.correct_option - 1],
            explanation: question.explanation || "No explanation available.",
            is_correct: isCorrect,
        });
    }

    function handleAnswer(selectedOption) {
        const optionButtons = optionsContainer.querySelectorAll(".option-btn");
        optionButtons.forEach((button) => button.classList.add("disabled"));

        const isCorrect = selectedOption === currentQuestion.correct_option;
        const correctButton = optionsContainer.querySelector(`[data-option="${currentQuestion.correct_option}"]`);
        if (correctButton) {
            correctButton.classList.add("correct");
        }

        if (!isCorrect) {
            const selectedButton = optionsContainer.querySelector(`[data-option="${selectedOption}"]`);
            if (selectedButton) {
                selectedButton.classList.add("incorrect");
            }
        }

        history[currentQuestion.difficulty].total += 1;
        questionsAsked += 1;
        logAnswer(currentQuestion, selectedOption, isCorrect);

        if (isCorrect) {
            history[currentQuestion.difficulty].correct += 1;
            currentStreak += 1;
            bestStreak = Math.max(bestStreak, currentStreak);
            feedbackTitle.textContent = "Great run";
            feedbackContainer.classList.add("correct");
        } else {
            currentStreak = 0;
            feedbackTitle.textContent = "Reset and recover";
            feedbackContainer.classList.add("incorrect");
        }

        feedbackText.textContent = currentQuestion.explanation || "Review the prompt and keep building momentum.";
        feedbackContainer.classList.add("visible");
        feedbackContainer.style.display = "block";
        nextQuestionBtn.style.display = "inline-flex";

        updateDifficultyAfterAnswer(isCorrect);
        updateProgress();
    }

    function renderReview() {
        reviewList.innerHTML = "";

        if (!answerLog.length) {
            reviewList.innerHTML = "<p class='muted'>No review data available for this session.</p>";
            return;
        }

        answerLog.forEach((entry, index) => {
            const card = document.createElement("article");
            card.className = "review-card";
            card.innerHTML = `
                <div class="panel-heading">
                    <div>
                        <p class="preview-label">Question ${index + 1}</p>
                        <h4>${entry.question_text}</h4>
                    </div>
                    <span class="result-pill ${entry.is_correct ? "correct" : "incorrect"}">
                        ${entry.is_correct ? "Correct" : "Wrong"}
                    </span>
                </div>
                <div class="review-detail-grid">
                    <div>
                        <span>Difficulty</span>
                        <strong>${entry.difficulty}</strong>
                    </div>
                    <div>
                        <span>Your answer</span>
                        <strong>${entry.selected_text}</strong>
                    </div>
                    <div>
                        <span>Correct answer</span>
                        <strong>${entry.correct_text}</strong>
                    </div>
                </div>
                <p class="review-explanation">${entry.explanation}</p>
            `;
            reviewList.appendChild(card);
        });
    }

    async function saveAttempt() {
        if (!currentUser || !selectedTopic || !questionsAsked) {
            hideMessage(summarySaveStatus);
            return;
        }

        try {
            const response = await fetch("/api/attempts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic_id: selectedTopic.topic_id,
                    overall_score: calculatePercent(getCorrectTotal(), questionsAsked),
                    beginner_score: calculatePercent(history.Beginner.correct, history.Beginner.total),
                    intermediate_score: calculatePercent(history.Intermediate.correct, history.Intermediate.total),
                    advanced_score: calculatePercent(history.Advanced.correct, history.Advanced.total),
                    questions_answered: questionsAsked,
                    best_streak: bestStreak,
                    highest_level: highestLevelReached,
                }),
            });

            if (response.status === 401) {
                currentUser = null;
                setAppMode();
                showMessage(summarySaveStatus, "Your session expired before this result could be saved.", true);
                return;
            }

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Unable to save attempt");
            }

            showMessage(summarySaveStatus, "This score has been saved to your history and leaderboard.");
            await Promise.all([fetchAttempts(), fetchLeaderboard()]);
        } catch (error) {
            console.error(error);
            showMessage(summarySaveStatus, error.message, true);
        }
    }

    async function showSummary() {
        quizFinished = true;
        const correctAnswers = getCorrectTotal();
        const wrongAnswers = questionsAsked - correctAnswers;

        document.getElementById("summary-topic-title").textContent = `${selectedTopic.topic_name} in ${selectedTopic.category}`;
        document.getElementById("summary-score").textContent = formatScore(correctAnswers, questionsAsked);
        document.getElementById("summary-correct").textContent = String(correctAnswers);
        document.getElementById("summary-wrong").textContent = String(wrongAnswers);
        document.getElementById("summary-level-badge").textContent = highestLevelReached;
        document.getElementById("summary-answered").textContent = String(questionsAsked);
        document.getElementById("summary-streak").textContent = String(bestStreak);
        document.getElementById("summary-breakdown").textContent = [
            formatScore(history.Beginner.correct, history.Beginner.total),
            formatScore(history.Intermediate.correct, history.Intermediate.total),
            formatScore(history.Advanced.correct, history.Advanced.total),
        ].join(" / ");
        renderReview();
        hideMessage(summarySaveStatus);
        switchView(summaryView);
        await saveAttempt();
    }

    function resetAppState() {
        questionBank = {};
        currentQuestion = null;
        currentDifficulty = "Beginner";
        questionsAsked = 0;
        totalQuestions = 0;
        correctStreak = 0;
        incorrectStreak = 0;
        currentStreak = 0;
        bestStreak = 0;
        highestLevelReached = "Beginner";
        quizFinished = false;
        history = createEmptyHistory();
        answerLog = [];
        resetQuestionUI();
        updateProgress();
        hideMessage(summarySaveStatus);
        reviewList.innerHTML = "";
    }

    async function startQuiz() {
        if (!currentUser || !selectedTopic) {
            return;
        }

        try {
            const response = await fetch(`/api/questions/${selectedTopic.topic_id}`);
            if (response.status === 401) {
                currentUser = null;
                setAppMode();
                showMessage(authMessage, "Your session expired. Please log in again.", true);
                return;
            }
            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Unable to load questions");
            }

            const payload = await response.json();
            questionBank = {};
            DIFFICULTIES.forEach((difficulty) => {
                questionBank[difficulty] = shuffle(payload.questions[difficulty] || []);
            });

            totalQuestions = Object.values(payload.question_counts).reduce((sum, count) => sum + count, 0);
            currentDifficulty = "Beginner";
            history = createEmptyHistory();
            answerLog = [];
            currentQuestion = null;
            questionsAsked = 0;
            correctStreak = 0;
            incorrectStreak = 0;
            currentStreak = 0;
            bestStreak = 0;
            highestLevelReached = "Beginner";
            quizFinished = false;

            quizTopicTitle.textContent = selectedTopic.topic_name;
            hideMessage(authMessage);
            switchView(quizView);
            loadNextQuestion();
        } catch (error) {
            console.error(error);
        }
    }

    async function submitAuthForm(endpoint, form, successMessage) {
        const formData = new FormData(form);
        const username = (formData.get("username") || "").toString().trim();
        const password = (formData.get("password") || "").toString();

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.error || "Authentication failed");
            }

            currentUser = payload.user;
            form.reset();
            setAppMode();
            showMessage(authMessage, successMessage || payload.message || "Authentication successful.");
            await Promise.all([fetchAttempts(), fetchLeaderboard()]);
        } catch (error) {
            console.error(error);
            showMessage(authMessage, error.message, true);
        }
    }

    async function logout() {
        try {
            await fetch("/api/logout", { method: "POST" });
        } catch (error) {
            console.error(error);
        }

        currentUser = null;
        selectedTopic = findSelectedTopic(topicSelect.value);
        resetAppState();
        renderAttempts([]);
        setAppMode();
        showMessage(authMessage, "You have been logged out.");
    }

    topicSelect.addEventListener("change", () => {
        selectedTopic = findSelectedTopic(topicSelect.value);
        updateTopicPreview(selectedTopic);
        startQuizBtn.disabled = !(currentUser && selectedTopic);
    });

    startQuizBtn.addEventListener("click", startQuiz);
    nextQuestionBtn.addEventListener("click", loadNextQuestion);
    restartBtn.addEventListener("click", async () => {
        resetAppState();
        switchView(topicSelectionView);
        await Promise.all([fetchAttempts(), fetchLeaderboard()]);
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitAuthForm("/api/login", loginForm, "Welcome back. Your streak and leaderboard position are ready.");
    });

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitAuthForm("/api/register", registerForm, "Account created. Your streak starts now.");
    });

    logoutBtn.addEventListener("click", logout);
    dashboardLogoutBtn.addEventListener("click", logout);

    history = createEmptyHistory();
    updateTopicPreview(null);
    updateProgress();
    fetchTopics();
    fetchSession();
    fetchLeaderboard();
});
