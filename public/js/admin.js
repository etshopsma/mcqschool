// =============================================
// admin.js — MCQSchool Admin Panel
// Handles: login, add question (with class/branch/subject/chapter),
//          delete, filter table
// =============================================

// ---- Elements ----
const loginScreen    = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginError     = document.getElementById('loginError');
const addError       = document.getElementById('addError');
const toast          = document.getElementById('toast');

// =============================================
// On load: check session
// =============================================
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res  = await fetch('/api/admin/status');
        const data = await res.json();
        if (data.isAdmin) showDashboard();
    } catch { /* stay on login */ }
});

// =============================================
// LOGIN
// =============================================
document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    loginError.classList.add('hidden');

    if (!username || !password) {
        showEl(loginError, 'Please enter both username and password.');
        return;
    }

    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.textContent = 'Logging in...';

    try {
        const res  = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginUsername').value = '';
            showDashboard();
        } else {
            showEl(loginError, data.message || 'Invalid credentials.');
        }
    } catch {
        showEl(loginError, 'Cannot connect to server.');
    } finally {
        btn.disabled = false; btn.textContent = 'Login';
    }
});

['loginPassword','loginUsername'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('loginBtn').click();
    });
});

// =============================================
// LOGOUT
// =============================================
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    adminDashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
});

// =============================================
// SHOW DASHBOARD
// =============================================
async function showDashboard() {
    loginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    await Promise.all([ refreshCount(), loadTable() ]);
}

// =============================================
// SHOW/HIDE BRANCH FIELD BASED ON CLASS
// =============================================
document.getElementById('adminClass').addEventListener('change', function () {
    const val = parseInt(this.value);
    const branchGroup = document.getElementById('branchGroup');
    if (val >= 9) {
        branchGroup.style.display = 'block';
    } else {
        branchGroup.style.display = 'none';
        document.getElementById('adminBranch').value = '';
    }
});

// =============================================
// REFRESH COUNT
// =============================================
async function refreshCount() {
    try {
        const res  = await fetch('/api/questions/count');
        const data = await res.json();
        if (data.success) {
            document.getElementById('poolCounter').textContent =
                `Total questions in database: ${data.count}`;
        }
    } catch { /* ignore */ }
}

// =============================================
// ADD QUESTION
// =============================================
document.getElementById('addQuestionBtn').addEventListener('click', async () => {
    addError.classList.add('hidden');

    const classLevel    = document.getElementById('adminClass').value;
    const branch        = document.getElementById('adminBranch').value.trim();
    const subject       = document.getElementById('adminSubject').value.trim();
    const chapter       = document.getElementById('adminChapter').value.trim();
    const question      = document.getElementById('adminQuestion').value.trim();
    const option1       = document.getElementById('adminOpt1').value.trim();
    const option2       = document.getElementById('adminOpt2').value.trim();
    const option3       = document.getElementById('adminOpt3').value.trim();
    const option4       = document.getElementById('adminOpt4').value.trim();
    const correct_answer = document.getElementById('adminCorrect').value.trim();

    // Validation
    if (!classLevel) { showEl(addError, 'Please select a class.'); return; }

    const classNum = parseInt(classLevel);
    if (classNum >= 9 && !branch) {
        showEl(addError, 'Branch is required for Class 9 and above.');
        return;
    }
    if (!subject || !chapter || !question ||
        !option1 || !option2 || !option3 || !option4 || !correct_answer) {
        showEl(addError, 'All fields are required. Please fill everything in.');
        return;
    }
    if (![option1, option2, option3, option4].includes(correct_answer)) {
        showEl(addError, 'Correct answer must exactly match one of the four options (try copy-paste).');
        return;
    }

    const btn = document.getElementById('addQuestionBtn');
    btn.disabled = true; btn.textContent = 'Adding...';

    try {
        const res = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                class_level: classLevel, branch, subject, chapter,
                question, option1, option2, option3, option4, correct_answer,
            }),
        });

        const data = await res.json();

        if (data.success) {
            // Clear form (keep class & branch)
            ['adminSubject','adminChapter','adminQuestion',
             'adminOpt1','adminOpt2','adminOpt3','adminOpt4','adminCorrect']
                .forEach(id => document.getElementById(id).value = '');

            document.getElementById('poolCounter').textContent =
                `Total questions in database: ${data.totalCount}`;

            showToast('✅ Question added successfully!');
            await loadTable();
        } else {
            showEl(addError, data.message || 'Failed to add question.');
        }
    } catch {
        showEl(addError, 'Server error. Could not add question.');
    } finally {
        btn.disabled = false; btn.textContent = 'Add Question to Database';
    }
});

// =============================================
// LOAD QUESTIONS TABLE
// =============================================
let allQuestions = [];

async function loadTable() {
    const wrap = document.getElementById('questionsTableWrap');
    wrap.innerHTML = '<p style="color:#94a3b8; font-style:italic; font-weight:600;">Loading questions...</p>';

    try {
        const res  = await fetch('/api/questions');
        const data = await res.json();

        if (!data.success) {
            wrap.innerHTML = `<p class="error-msg">${data.message}</p>`;
            return;
        }

        allQuestions = data.questions;
        populateFilters(allQuestions);
        renderTable(allQuestions);

    } catch {
        wrap.innerHTML = '<p class="error-msg">Failed to load questions.</p>';
    }
}

function populateFilters(questions) {
    const classSet   = [...new Set(questions.map(q => q.class_level))].sort((a,b) => a-b);
    const subjectSet = [...new Set(questions.map(q => q.subject))].sort();

    const fc = document.getElementById('filterClass');
    const fs = document.getElementById('filterSubject');

    const curClass   = fc.value;
    const curSubject = fs.value;

    fc.innerHTML = '<option value="">All Classes</option>' +
        classSet.map(c => `<option value="${c}" ${c == curClass ? 'selected':''}>Class ${c}</option>`).join('');

    fs.innerHTML = '<option value="">All Subjects</option>' +
        subjectSet.map(s => `<option value="${s}" ${s === curSubject ? 'selected':''}>
            ${escapeHtml(s)}</option>`).join('');
}

// Filter handlers
document.getElementById('filterClass').addEventListener('change', applyFilter);
document.getElementById('filterSubject').addEventListener('change', applyFilter);

function applyFilter() {
    const cls = document.getElementById('filterClass').value;
    const sub = document.getElementById('filterSubject').value;

    let filtered = allQuestions;
    if (cls) filtered = filtered.filter(q => q.class_level == cls);
    if (sub) filtered = filtered.filter(q => q.subject === sub);

    renderTable(filtered);
}

function renderTable(questions) {
    const wrap = document.getElementById('questionsTableWrap');

    if (questions.length === 0) {
        wrap.innerHTML = '<p style="color:#94a3b8; font-style:italic; font-weight:600; text-align:center; padding:20px 0;">No questions match the current filter.</p>';
        return;
    }

    let html = `
        <table class="q-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Class / Branch</th>
                    <th>Subject / Chapter</th>
                    <th>Question</th>
                    <th>Correct Answer</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
    `;

    questions.forEach((q, i) => {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>
                    <span class="badge badge-blue">Class ${q.class_level}</span>
                    ${q.branch
                        ? `<br><span class="badge badge-purple" style="margin-top:4px;">${escapeHtml(q.branch)}</span>`
                        : ''}
                </td>
                <td>
                    <div style="font-weight:700;">${escapeHtml(q.subject)}</div>
                    <div style="font-size:12px; color:#64748b; margin-top:2px;">${escapeHtml(q.chapter)}</div>
                </td>
                <td style="max-width:250px;">${escapeHtml(q.question)}</td>
                <td><span class="badge badge-green">${escapeHtml(q.correct_answer)}</span></td>
                <td>
                    <button class="btn-danger" style="padding:5px 12px; font-size:12px;"
                        onclick="deleteQuestion(${q.id}, '${escapeAttr(q.question)}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    wrap.innerHTML = html;
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
            document.getElementById('poolCounter').textContent =
                `Total questions in database: ${data.totalCount}`;
            showToast('🗑️ Question deleted.');
            await loadTable();
        } else {
            alert('Failed to delete: ' + data.message);
        }
    } catch {
        alert('Server error. Could not delete.');
    }
}

// =============================================
// HELPERS
// =============================================
function showEl(el, msg) {
    el.textContent = msg;
    el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
}

function escapeAttr(str) {
    return String(str).replace(/'/g, "\\'");
}
