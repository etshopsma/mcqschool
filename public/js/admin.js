// =============================================
// admin.js — Admin Panel Frontend Logic
// Handles: login, session check, add question,
//          delete question, list all questions
// =============================================

// ---- Element References ----
const loginScreen    = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');

const loginUsername  = document.getElementById('loginUsername');
const loginPassword  = document.getElementById('loginPassword');
const loginBtn       = document.getElementById('loginBtn');
const loginError     = document.getElementById('loginError');

const logoutBtn      = document.getElementById('logoutBtn');

const addQuestionBtn = document.getElementById('addQuestionBtn');
const poolCounter    = document.getElementById('poolCounter');
const addError       = document.getElementById('addError');
const toast          = document.getElementById('toast');

// =============================================
// On page load — check if already logged in
// =============================================
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res  = await fetch('/api/admin/status');
        const data = await res.json();

        if (data.isAdmin) {
            showDashboard();
        }
    } catch {
        // Server unreachable — stay on login
    }
});

// =============================================
// LOGIN
// =============================================
loginBtn.addEventListener('click', async () => {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    loginError.classList.add('hidden');

    if (!username || !password) {
        showLoginError('Please enter both username and password.');
        return;
    }

    loginBtn.disabled    = true;
    loginBtn.textContent = 'Logging in...';

    try {
        const res  = await fetch('/api/admin/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            loginPassword.value = '';
            loginUsername.value = '';
            showDashboard();
        } else {
            showLoginError(data.message || 'Login failed. Check your credentials.');
        }

    } catch {
        showLoginError('Could not connect to server. Is it running?');
    } finally {
        loginBtn.disabled    = false;
        loginBtn.textContent = 'Login';
    }
});

// Allow pressing Enter in password field to submit
loginPassword.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginBtn.click();
});
loginUsername.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginBtn.click();
});

// =============================================
// LOGOUT
// =============================================
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
    } catch { /* ignore */ }

    adminDashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
});

// =============================================
// SHOW DASHBOARD
// =============================================
async function showDashboard() {
    loginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    await refreshData();
}

// =============================================
// REFRESH: question count + table
// =============================================
async function refreshData() {
    await Promise.all([
        refreshCount(),
        loadQuestionsTable()
    ]);
}

async function refreshCount() {
    try {
        const res  = await fetch('/api/questions/count');
        const data = await res.json();
        if (data.success) {
            poolCounter.textContent =
                `Total questions in database: ${data.count}`;
        }
    } catch { /* ignore */ }
}

// =============================================
// ADD QUESTION
// =============================================
addQuestionBtn.addEventListener('click', async () => {
    addError.classList.add('hidden');

    const question      = document.getElementById('adminQuestion').value.trim();
    const option1       = document.getElementById('adminOpt1').value.trim();
    const option2       = document.getElementById('adminOpt2').value.trim();
    const option3       = document.getElementById('adminOpt3').value.trim();
    const option4       = document.getElementById('adminOpt4').value.trim();
    const correct_answer = document.getElementById('adminCorrect').value.trim();

    if (!question || !option1 || !option2 || !option3 || !option4 || !correct_answer) {
        showAddError('Please fill in all fields before submitting.');
        return;
    }

    const opts = [option1, option2, option3, option4];
    if (!opts.includes(correct_answer)) {
        showAddError('The correct answer must exactly match one of the four options (copy-paste to be sure).');
        return;
    }

    addQuestionBtn.disabled    = true;
    addQuestionBtn.textContent = 'Adding...';

    try {
        const res = await fetch('/api/questions', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ question, option1, option2, option3, option4, correct_answer })
        });

        const data = await res.json();

        if (data.success) {
            // Clear form
            ['adminQuestion','adminOpt1','adminOpt2','adminOpt3','adminOpt4','adminCorrect']
                .forEach(id => document.getElementById(id).value = '');

            poolCounter.textContent = `Total questions in database: ${data.totalCount}`;
            showToast('✅ Question added successfully!');
            await loadQuestionsTable();

        } else {
            showAddError(data.message || 'Failed to add question.');
        }

    } catch {
        showAddError('Server error. Could not add question.');
    } finally {
        addQuestionBtn.disabled    = false;
        addQuestionBtn.textContent = 'Add Question to Database';
    }
});

// =============================================
// LOAD QUESTIONS TABLE
// =============================================
async function loadQuestionsTable() {
    const wrap = document.getElementById('questionsTableWrap');
    wrap.innerHTML = '<p class="loading-msg">Loading questions...</p>';

    try {
        const res  = await fetch('/api/questions');
        const data = await res.json();

        if (!data.success) {
            wrap.innerHTML = `<p class="error-msg">${data.message}</p>`;
            return;
        }

        if (data.questions.length === 0) {
            wrap.innerHTML = '<p class="loading-msg">No questions yet. Add some above!</p>';
            return;
        }

        let html = `
            <table class="questions-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>Options</th>
                        <th>Correct Answer</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.questions.forEach((q, i) => {
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${escapeHtml(q.question)}</td>
                    <td style="line-height:1.8;">
                        ${escapeHtml(q.option1)}<br>
                        ${escapeHtml(q.option2)}<br>
                        ${escapeHtml(q.option3)}<br>
                        ${escapeHtml(q.option4)}
                    </td>
                    <td><strong style="color:#16a34a;">${escapeHtml(q.correct_answer)}</strong></td>
                    <td>
                        <button class="delete-btn"
                            data-id="${q.id}"
                            data-q="${escapeHtml(q.question)}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        wrap.innerHTML = html;

        // Attach delete handlers
        wrap.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const qText = btn.getAttribute('data-q');
                deleteQuestion(id, qText);
            });
        });

    } catch {
        wrap.innerHTML = '<p class="error-msg">Failed to load questions from server.</p>';
    }
}

// =============================================
// DELETE QUESTION
// =============================================
async function deleteQuestion(id, questionText) {
    const preview = questionText.length > 60
        ? questionText.substring(0, 60) + '...'
        : questionText;

    if (!confirm(`Delete this question?\n\n"${preview}"\n\nThis cannot be undone.`)) return;

    try {
        const res  = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
            poolCounter.textContent = `Total questions in database: ${data.totalCount}`;
            showToast('🗑️ Question deleted.');
            await loadQuestionsTable();
        } else {
            alert('Failed to delete: ' + data.message);
        }

    } catch {
        alert('Server error. Could not delete question.');
    }
}

// =============================================
// Helpers
// =============================================
function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.classList.remove('hidden');
}

function showAddError(msg) {
    addError.textContent = msg;
    addError.classList.remove('hidden');
    addError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}
