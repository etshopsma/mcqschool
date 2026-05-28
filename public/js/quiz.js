// =============================================
// quiz.js — MCQSchool Frontend
// Flow: Class → (Branch if 9+) → Subject → Chapter → Quiz → Result
// =============================================

// ---- Screen Elements ----
const screens = {
    class:   document.getElementById('classScreen'),
    branch:  document.getElementById('branchScreen'),
    subject: document.getElementById('subjectScreen'),
    chapter: document.getElementById('chapterScreen'),
    quiz:    document.getElementById('quizScreen'),
    result:  document.getElementById('resultScreen'),
};

const breadcrumb = document.getElementById('breadcrumb');

// ---- Quiz State ----
const state = {
    classLevel: null,   // e.g. 9
    branch:     null,   // e.g. 'Science' (only class >= 9)
    subject:    null,   // e.g. 'Physics'
    chapter:    null,   // e.g. 'Chapter 1: Motion'
    questions:  [],
    current:    0,
    score:      0,
    answers:    [],
    selected:   '',
};

// Branch icons map
const BRANCH_ICONS = {
    'Science':         '🔬',
    'Humanities':      '📜',
    'Business Studies':'💼',
};

const SUBJECT_ICONS = {
    'Mathematics': '🧮', 'Physics': '⚡', 'Chemistry': '⚗️',
    'Biology': '🧬', 'English': '📘', 'Bangla': '📕',
    'History': '🏛️', 'Geography': '🌍', 'Accounting': '📊',
    'Economics': '📈', 'Science': '🔭', 'ICT': '💻',
    'Religion': '🕌', 'Agriculture': '🌾',
};

// =============================================
// SHOW / HIDE SCREENS
// =============================================
function showOnly(name) {
    Object.keys(screens).forEach(k => screens[k].classList.add('hidden'));
    screens[name].classList.remove('hidden');
    updateBreadcrumb();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// BREADCRUMB
// =============================================
function updateBreadcrumb() {
    const items = [];

    if (state.classLevel) items.push({ label: `Class ${state.classLevel}`, goTo: 'class' });
    if (state.branch)     items.push({ label: state.branch,  goTo: 'branch'  });
    if (state.subject)    items.push({ label: state.subject, goTo: 'subject' });
    if (state.chapter)    items.push({ label: state.chapter, goTo: 'chapter' });

    if (items.length === 0) {
        breadcrumb.classList.add('hidden');
        return;
    }

    breadcrumb.classList.remove('hidden');
    breadcrumb.innerHTML = items.map((item, i) => `
        <div class="breadcrumb-item">
            ${i > 0 ? '<span class="breadcrumb-sep">›</span>' : ''}
            <span onclick="goBackTo('${item.goTo}')">${escapeHtml(item.label)}</span>
        </div>
    `).join('');
}

// Navigate back to a specific step
function goBackTo(step) {
    if (step === 'class') {
        state.classLevel = null;
        state.branch     = null;
        state.subject    = null;
        state.chapter    = null;
        showOnly('class');
    } else if (step === 'branch') {
        state.branch   = null;
        state.subject  = null;
        state.chapter  = null;
        if (state.classLevel >= 9) showOnly('branch');
        else showOnly('class');
    } else if (step === 'subject') {
        state.subject = null;
        state.chapter = null;
        showOnly('subject');
    } else if (step === 'chapter') {
        state.chapter = null;
        showOnly('chapter');
    }
}

// =============================================
// LOADING SKELETON
// =============================================
function showSkeleton(containerId, rows = 3) {
    const el = document.getElementById(containerId);
    el.innerHTML = Array(rows).fill('<div class="loading-row"></div>').join('');
}

// =============================================
// STEP 1: LOAD CLASSES
// =============================================
window.addEventListener('DOMContentLoaded', loadClasses);

async function loadClasses() {
    const juniorGrid = document.getElementById('juniorGrid');
    const seniorGrid = document.getElementById('seniorGrid');
    const classError = document.getElementById('classError');
    const noClassMsg = document.getElementById('noClassMsg');

    juniorGrid.innerHTML = '<div class="loading-row"></div>'.repeat(4);
    seniorGrid.innerHTML = '<div class="loading-row"></div>'.repeat(4);

    try {
        const res  = await fetch('/api/classes');
        const data = await res.json();

        if (!data.success || data.classes.length === 0) {
            juniorGrid.innerHTML = '';
            seniorGrid.innerHTML = '';
            noClassMsg.classList.remove('hidden');
            return;
        }

        const junior = data.classes.filter(c => c <= 8);
        const senior = data.classes.filter(c => c >= 9);

        juniorGrid.innerHTML = junior.length
            ? junior.map(c => `
                <button class="class-btn" onclick="selectClass(${c})">
                    Class ${c}
                </button>`).join('')
            : '<p style="color:#94a3b8; font-size:13px; font-weight:600;">No junior classes yet</p>';

        seniorGrid.innerHTML = senior.length
            ? senior.map(c => `
                <button class="class-btn senior" onclick="selectClass(${c})">
                    Class ${c}
                </button>`).join('')
            : '<p style="color:#94a3b8; font-size:13px; font-weight:600;">No senior classes yet</p>';

    } catch {
        classError.textContent = 'Could not connect to server.';
        classError.classList.remove('hidden');
    }
}

// =============================================
// STEP 2: CLASS SELECTED
// =============================================
async function selectClass(classLevel) {
    state.classLevel = classLevel;
    state.branch     = null;
    state.subject    = null;
    state.chapter    = null;

    if (classLevel >= 9) {
        // Show branch selection
        document.getElementById('branchSubtitle').textContent =
            `Class ${classLevel} — Choose your academic branch`;
        await loadBranches(classLevel);
        showOnly('branch');
    } else {
        // Go straight to subjects
        await loadSubjects();
        showOnly('subject');
    }
}

// =============================================
// STEP 3a: LOAD BRANCHES (Class 9+)
// =============================================
async function loadBranches(classLevel) {
    const grid  = document.getElementById('branchGrid');
    const error = document.getElementById('branchError');
    error.classList.add('hidden');
    grid.innerHTML = '<div class="loading-row"></div>'.repeat(3);

    try {
        const res  = await fetch(`/api/branches?class=${classLevel}`);
        const data = await res.json();

        if (!data.success || data.branches.length === 0) {
            grid.innerHTML = '<p style="color:#94a3b8; font-size:14px; font-weight:600;">No branches found for this class.</p>';
            return;
        }

        grid.innerHTML = data.branches.map(b => `
            <div class="select-card branch-card" onclick="selectBranch('${escapeAttr(b)}')">
                <div class="card-icon">${BRANCH_ICONS[b] || '📚'}</div>
                <div class="card-label">${escapeHtml(b)}</div>
            </div>
        `).join('');

    } catch {
        error.textContent = 'Failed to load branches.';
        error.classList.remove('hidden');
    }
}

// =============================================
// STEP 3b: BRANCH SELECTED
// =============================================
async function selectBranch(branch) {
    state.branch  = branch;
    state.subject = null;
    state.chapter = null;
    await loadSubjects();
    showOnly('subject');
}

// =============================================
// STEP 4: LOAD SUBJECTS
// =============================================
async function loadSubjects() {
    const list  = document.getElementById('subjectList');
    const error = document.getElementById('subjectError');
    const sub   = document.getElementById('subjectSubtitle');

    error.classList.add('hidden');

    sub.textContent = state.branch
        ? `Class ${state.classLevel} › ${state.branch}`
        : `Class ${state.classLevel}`;

    list.innerHTML = '<div class="loading-row"></div>'.repeat(3);

    try {
        const params = new URLSearchParams({ class: state.classLevel });
        if (state.branch) params.set('branch', state.branch);

        const res  = await fetch(`/api/subjects?${params}`);
        const data = await res.json();

        if (!data.success || data.subjects.length === 0) {
            list.innerHTML = '<p style="color:#94a3b8; font-size:14px; font-weight:600;">No subjects found.</p>';
            return;
        }

        list.innerHTML = data.subjects.map(s => `
            <button class="item-btn" onclick="selectSubject('${escapeAttr(s)}')">
                <span>${SUBJECT_ICONS[s] || '📚'} ${escapeHtml(s)}</span>
                <span class="arrow">›</span>
            </button>
        `).join('');

    } catch {
        error.textContent = 'Failed to load subjects.';
        error.classList.remove('hidden');
    }
}

// =============================================
// STEP 5: SUBJECT SELECTED → LOAD CHAPTERS
// =============================================
async function selectSubject(subject) {
    state.subject = subject;
    state.chapter = null;

    const list  = document.getElementById('chapterList');
    const error = document.getElementById('chapterError');
    const sub   = document.getElementById('chapterSubtitle');

    error.classList.add('hidden');

    const parts = [`Class ${state.classLevel}`];
    if (state.branch) parts.push(state.branch);
    parts.push(subject);
    sub.textContent = parts.join(' › ');

    list.innerHTML = '<div class="loading-row"></div>'.repeat(3);
    showOnly('chapter');

    try {
        const params = new URLSearchParams({ class: state.classLevel, subject });
        if (state.branch) params.set('branch', state.branch);

        const res  = await fetch(`/api/chapters?${params}`);
        const data = await res.json();

        if (!data.success || data.chapters.length === 0) {
            list.innerHTML = '<p style="color:#94a3b8; font-size:14px; font-weight:600;">No chapters found for this subject.</p>';
            return;
        }

        list.innerHTML = data.chapters.map(ch => `
            <button class="item-btn" onclick="selectChapter('${escapeAttr(ch)}')">
                <span>📄 ${escapeHtml(ch)}</span>
                <span class="arrow">›</span>
            </button>
        `).join('');

    } catch {
        error.textContent = 'Failed to load chapters.';
        error.classList.remove('hidden');
    }
}

// =============================================
// STEP 6: CHAPTER SELECTED → START QUIZ
// =============================================
async function selectChapter(chapter) {
    state.chapter = chapter;

    // Build quiz path label
    const parts = [`Class ${state.classLevel}`];
    if (state.branch) parts.push(state.branch);
    parts.push(state.subject, chapter);
    const pathLabel = parts.join(' › ');

    document.getElementById('quizPath').textContent    = pathLabel;
    document.getElementById('resultPath').textContent  = `📍 ${pathLabel}`;

    showOnly('quiz');

    // Reset quiz state
    state.current  = 0;
    state.score    = 0;
    state.answers  = [];
    state.selected = '';
    state.questions = [];

    document.getElementById('optionsContainer').innerHTML = '';
    document.getElementById('questionText').textContent   = 'Loading questions...';
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('quizError').classList.add('hidden');

    try {
        const params = new URLSearchParams({
            class: state.classLevel,
            subject: state.subject,
            chapter: chapter,
            count: 50   // fetch up to 50 from this chapter
        });
        if (state.branch) params.set('branch', state.branch);

        const res  = await fetch(`/api/questions/random?${params}`);
        const data = await res.json();

        if (!data.success) {
            document.getElementById('questionText').textContent = '';
            showQuizError(data.message || 'No questions found.');
            return;
        }

        state.questions = data.questions;
        document.getElementById('nextBtn').disabled = false;
        renderQuestion();

    } catch {
        showQuizError('Could not connect to server.');
    }
}

// =============================================
// RENDER QUESTION
// =============================================
function renderQuestion() {
    state.selected = '';
    document.getElementById('quizError').classList.add('hidden');

    const q     = state.questions[state.current];
    const total = state.questions.length;
    const num   = state.current + 1;

    // Progress
    document.getElementById('quizProgressLabel').textContent = `${num} / ${total}`;
    document.getElementById('progressBar').style.width = `${(num / total) * 100}%`;

    document.getElementById('questionText').textContent = q.question;

    const letters = ['A', 'B', 'C', 'D'];
    document.getElementById('optionsContainer').innerHTML = q.options.map((opt, i) => `
        <div class="option" onclick="selectOption(this, '${escapeAttr(opt)}')">
            <div class="option-letter">${letters[i]}</div>
            <span>${escapeHtml(opt)}</span>
        </div>
    `).join('');

    document.getElementById('nextBtn').textContent =
        state.current === total - 1 ? '✅ Finish Test' : 'Next Question →';
}

function selectOption(el, value) {
    document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    state.selected = value;
    document.getElementById('quizError').classList.add('hidden');
}

// =============================================
// NEXT BUTTON
// =============================================
document.getElementById('nextBtn').addEventListener('click', () => {
    if (!state.selected) {
        showQuizError('Please select an answer before continuing.');
        return;
    }

    const q         = state.questions[state.current];
    const isCorrect = state.selected === q.answer;
    if (isCorrect) state.score++;

    state.answers.push({
        question:  q.question,
        selected:  state.selected,
        correct:   q.answer,
        isCorrect,
    });

    state.current++;

    if (state.current < state.questions.length) {
        renderQuestion();
    } else {
        showResult();
    }
});

// =============================================
// RESULT SCREEN
// =============================================
function showResult() {
    showOnly('result');

    const total   = state.answers.length;
    const wrong   = total - state.score;
    const pct     = total > 0 ? Math.round((state.score / total) * 100) : 0;

    document.getElementById('scoreNumber').textContent    = `${state.score}/${total}`;
    document.getElementById('statCorrect').textContent    = state.score;
    document.getElementById('statWrong').textContent      = wrong;
    document.getElementById('statAccuracy').textContent   = `${pct}%`;

    const review = document.getElementById('reviewContainer');
    review.innerHTML = state.answers.map(a => `
        <div class="review-item ${a.isCorrect ? 'correct-item' : 'wrong-item'}">
            <div class="review-q">${escapeHtml(a.question)}</div>
            <div class="review-detail">
                <span>Your answer:</span>
                <span class="${a.isCorrect ? 'tag-correct' : 'tag-wrong'}">${escapeHtml(a.selected)}</span>
            </div>
            ${!a.isCorrect ? `
            <div class="review-detail">
                <span>Correct answer:</span>
                <span class="tag-correct">${escapeHtml(a.correct)}</span>
            </div>` : ''}
        </div>
    `).join('');
}

// =============================================
// RESULT BUTTONS
// =============================================
document.getElementById('retryBtn').addEventListener('click', () => {
    selectChapter(state.chapter);
});

document.getElementById('newTestBtn').addEventListener('click', () => {
    state.classLevel = null;
    state.branch     = null;
    state.subject    = null;
    state.chapter    = null;
    loadClasses();
    showOnly('class');
});

// =============================================
// HELPERS
// =============================================
function showQuizError(msg) {
    const el = document.getElementById('quizError');
    el.textContent = msg;
    el.classList.remove('hidden');
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
}

function escapeAttr(str) {
    return String(str).replace(/'/g, "\\'");
}
