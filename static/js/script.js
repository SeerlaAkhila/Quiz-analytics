document.addEventListener("DOMContentLoaded", () => {
    const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
    const LEVEL_UP_THRESHOLD = 2;
    const LEVEL_DOWN_THRESHOLD = 2;

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
    const nextQuestionBtn = document.getElementById("next-question-btn");
    const restartBtn = document.getElementById("restart-btn");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const logoutBtn = document.getElementById("logout-btn");
    const authForms = document.getElementById("auth-forms");
    const authActions = document.getElementById("auth-actions");
    const authStatus = document.getElementById("auth-status");
    const authMessage = document.getElementById("auth-message");
    const userBadge = document.getElementById("user-badge");
    const attemptList = document.getElementById("attempt-list");
    const historyEmpty = document.getElementById("history-empty");
    const summarySaveStatus = document.getElementById("summary-save-status");

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

    function updateAuthUI() {
        if (currentUser) {
            authStatus.textContent = `Signed in as ${currentUser.username}. Your quiz attempts will be saved automatically.`;
            userBadge.textContent = currentUser.username;
            userBadge.classList.remove("hidden");
            authForms.classList.add("hidden");
            authActions.classList.remove("hidden");
        } else {
            authStatus.textContent = "You are currently browsing as a guest.";
            userBadge.classList.add("hidden");
            authForms.classList.remove("hidden");
            authActions.classList.add("hidden");
        }

        startQuizBtn.disabled = !(currentUser && selectedTopic);
    }

    function updateTopicPreview(topic) {
        if (!topic) {
            selectedTopicName.textContent = "Choose a topic";
            selectedTopicCategory.textContent = "Your personalized session details will appear here.";
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
        topicSelect.innerHTML = '<option value="">Select a topic</option>';

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
            updateAuthUI();
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
            return;
        }

        try {
            const response = await fetch("/api/attempts");
            if (response.status === 401) {
                currentUser = null;
                updateAuthUI();
                renderAttempts([]);
                return;
            }
            if (!response.ok) {
                throw new Error("Unable to load attempts");
            }

            const payload = await response.json();
            renderAttempts(payload.attempts || []);
        } catch (error) {
            console.error(error);
            renderAttempts([]);
        }
    }

    function renderAttempts(attempts) {
        attemptList.innerHTML = "";

        if (!currentUser) {
            historyEmpty.textContent = "Log in to see your recent quiz attempts here.";
            historyEmpty.classList.remove("hidden");
            return;
        }

        if (!attempts.length) {
            historyEmpty.textContent = "No saved attempts yet. Finish a quiz to start building your history.";
            historyEmpty.classList.remove("hidden");
            return;
        }

        historyEmpty.classList.add("hidden");
        attempts.forEach((attempt) => {
            const card = document.createElement("article");
            card.className = "attempt-card";
            card.innerHTML = `
                <h4>${attempt.topic_name}</h4>
                <p>${attempt.category} • ${formatDate(attempt.created_at)}</p>
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

    function updateProgress() {
        const answeredCount = getAnsweredTotal();
        const accuracy = answeredCount ? calculatePercent(getCorrectTotal(), answeredCount) : 0;
        const progressPercentage = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0;

        progressBarInner.style.width = `${progressPercentage}%`;
        progressText.textContent = `Question ${Math.min(answeredCount + 1, totalQuestions || 1)} of ${totalQuestions || 0}`;
        accuracyPill.textContent = `${accuracy}%`;
        streakPill.textContent = `${currentStreak}`;
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

        if (isCorrect) {
            history[currentQuestion.difficulty].correct += 1;
            currentStreak += 1;
            bestStreak = Math.max(bestStreak, currentStreak);
            feedbackTitle.textContent = "Nice work";
            feedbackContainer.classList.add("correct");
        } else {
            currentStreak = 0;
            feedbackTitle.textContent = "Keep going";
            feedbackContainer.classList.add("incorrect");
        }

        feedbackText.textContent = currentQuestion.explanation || "Review the prompt and keep building momentum.";
        feedbackContainer.classList.add("visible");
        feedbackContainer.style.display = "block";
        nextQuestionBtn.style.display = "inline-flex";

        updateDifficultyAfterAnswer(isCorrect);
        updateProgress();
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
                updateAuthUI();
                showMessage(summarySaveStatus, "Your session expired before this result could be saved.", true);
                return;
            }

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Unable to save attempt");
            }

            showMessage(summarySaveStatus, "This score has been saved to your history.");
            await fetchAttempts();
        } catch (error) {
            console.error(error);
            showMessage(summarySaveStatus, error.message, true);
        }
    }

    async function showSummary() {
        quizFinished = true;
        document.getElementById("summary-topic-title").textContent = `${selectedTopic.topic_name} in ${selectedTopic.category}`;
        document.getElementById("summary-score").textContent = formatScore(getCorrectTotal(), questionsAsked);
        document.getElementById("summary-beginner").textContent = formatScore(history.Beginner.correct, history.Beginner.total);
        document.getElementById("summary-intermediate").textContent = formatScore(history.Intermediate.correct, history.Intermediate.total);
        document.getElementById("summary-advanced").textContent = formatScore(history.Advanced.correct, history.Advanced.total);
        document.getElementById("summary-answered").textContent = String(questionsAsked);
        document.getElementById("summary-streak").textContent = String(bestStreak);
        document.getElementById("summary-level").textContent = highestLevelReached;
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
        resetQuestionUI();
        updateProgress();
        hideMessage(summarySaveStatus);
    }

    async function startQuiz() {
        if (!currentUser) {
            showMessage(authMessage, "Please log in before starting a quiz.", true);
            return;
        }
        if (!selectedTopic) {
            return;
        }

        try {
            const response = await fetch(`/api/questions/${selectedTopic.topic_id}`);
            if (response.status === 401) {
                currentUser = null;
                updateAuthUI();
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
            showMessage(authMessage, error.message, true);
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
            updateAuthUI();
            showMessage(authMessage, successMessage || payload.message || "Authentication successful.");
            await fetchAttempts();
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
        updateAuthUI();
        renderAttempts([]);
        resetAppState();
        switchView(topicSelectionView);
        showMessage(authMessage, "You have been logged out.");
    }

    topicSelect.addEventListener("change", () => {
        selectedTopic = findSelectedTopic(topicSelect.value);
        updateTopicPreview(selectedTopic);
        updateAuthUI();
    });

    startQuizBtn.addEventListener("click", startQuiz);
    nextQuestionBtn.addEventListener("click", loadNextQuestion);
    restartBtn.addEventListener("click", () => {
        resetAppState();
        switchView(topicSelectionView);
        fetchAttempts();
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitAuthForm("/api/login", loginForm, "Welcome back. Your history is ready.");
    });

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitAuthForm("/api/register", registerForm, "Account created. You're ready to start learning.");
    });

    logoutBtn.addEventListener("click", logout);

    history = createEmptyHistory();
    updateTopicPreview(null);
    updateProgress();
    fetchTopics();
    fetchSession();
});
