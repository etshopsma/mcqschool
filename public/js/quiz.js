// =============================================
// quiz.js — Quiz Frontend Logic
// Handles: home screen, quiz flow, results
// All questions are fetched from the server API.
// =============================================

// ---- Element References ----
const homeScreen      = document.getElementById('homeScreen');
const quizScreen      = document.getElementById('quizScreen');
const resultScreen    = document.getElementById('resultScreen');

const startBtn        = document.getElementById('startBtn');
const nextBtn         = document.getElementById('nextBtn');
const restartBtn      = document.getElementById('restartBtn');

const questionText    = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const questionCount   = document.getElementById('questionCount');

const scoreText       = document.getElementById('scoreText');
const correctCount    = document.getElementById('correctCount');
const wrongCount      = document.getElementById('wrongCount');
const accuracy        = document.getElementById('accuracy');
const reviewContainer = document.getElementById('reviewContainer');

const homeError       = document.getElementById('homeError');
const quizError       = document.getElementById('quizError');
const questionPoolInfo = document.getElementById('questionPoolInfo');

// ---- Quiz State ----
let selectedQuestions    = [];
let currentQuestionIndex = 0;
let score                = 0;
let selectedAnswer       = '';
let userAnswers          = [];

// =============================================
// On page load: show total question count
// =============================================
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res  = await fetch('/api/questions/count');
        const data = await res.json();
        if (data.success) {
            questionPoolInfo.textContent =
                `📚 Question bank: ${data.count} question${data.count !== 1 ? 's' : ''} available`;
        }
    } catch {
        // Non-critical — silently ignore
    }
});

// =============================================
// START TEST — fetch 3 random questions from API
// =============================================
startBtn.addEventListener('click', async () => {
    homeError.classList.add('hidden');
    startBtn.disabled   = true;
    startBtn.textContent = 'Loading...';

    try {
        const res  = await fetch('/api/questions/random?count=3');
        const data = await res.json();

        if (!data.success) {
            showHomeError(data.message || 'Failed to load questions.');
            return;
        }

        if (data.questions.length < 3) {
            showHomeError(`Not enough questions in the database (found ${data.questions.length}). Please ask the admin to add more.`);
            return;
        }

        // Reset state
        selectedQuestions    = data.questions;
        currentQuestionIndex = 0;
        score                = 0;
        selectedAnswer       = '';
        userAnswers          = [];

        // Switch screens
        homeScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        loadQuestion();

    } catch (err) {
        showHomeError('Could not connect to the server. Is it running?');
    } finally {
        startBtn.disabled    = false;
        startBtn.textContent = 'Start Mock Test';
    }
});

// =============================================
// LOAD QUESTION — render current question
// =============================================
function loadQuestion() {
    selectedAnswer = '';
    quizError.classList.add('hidden');

    const q = selectedQuestions[currentQuestionIndex];

    questionCount.textContent =
        `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';

    q.options.forEach(option => {
        const div = document.createElement('div');
        div.classList.add('option');
        div.textContent = option;

        div.addEventListener('click', () => {
            // Deselect all, select clicked
            document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            div.classList.add('selected');
            selectedAnswer = option;
        });

        optionsContainer.appendChild(div);
    });

    // Label the button on the last question
    nextBtn.textContent =
        currentQuestionIndex === selectedQuestions.length - 1
            ? 'Finish Test'
            : 'Next Question';
}

// =============================================
// NEXT QUESTION / FINISH TEST
// =============================================
nextBtn.addEventListener('click', () => {
    if (!selectedAnswer) {
        quizError.classList.remove('hidden');
        quizError.textContent = 'Please select an answer before continuing.';
        return;
    }

    quizError.classList.add('hidden');

    const q         = selectedQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === q.answer;

    if (isCorrect) score++;

    userAnswers.push({
        question:  q.question,
        selected:  selectedAnswer,
        correct:   q.answer,
        isCorrect
    });

    currentQuestionIndex++;

    if (currentQuestionIndex < selectedQuestions.length) {
        loadQuestion();
    } else {
        showResult();
    }
});

// =============================================
// SHOW RESULT SCREEN
// =============================================
function showResult() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const total      = selectedQuestions.length;
    const wrong      = total - score;
    const percentage = Math.round((score / total) * 100);

    scoreText.textContent    = `${score}/${total}`;
    correctCount.textContent = score;
    wrongCount.textContent   = wrong;
    accuracy.textContent     = `${percentage}%`;

    reviewContainer.innerHTML = '';

    userAnswers.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('review-item');
        div.innerHTML = `
            <div class="review-question">${escapeHtml(item.question)}</div>
            <p>Your Answer:
                <span class="${item.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                    ${escapeHtml(item.selected)}
                </span>
            </p>
            <p>Correct Answer:
                <span class="correct-answer">${escapeHtml(item.correct)}</span>
            </p>
        `;
        reviewContainer.appendChild(div);
    });
}

// =============================================
// RESTART — go back to home
// =============================================
restartBtn.addEventListener('click', () => {
    resultScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    // Refresh count in case admin added questions
    fetch('/api/questions/count')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                questionPoolInfo.textContent =
                    `📚 Question bank: ${data.count} question${data.count !== 1 ? 's' : ''} available`;
            }
        })
        .catch(() => {});
});

// =============================================
// Helpers
// =============================================
function showHomeError(msg) {
    homeError.textContent = msg;
    homeError.classList.remove('hidden');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
