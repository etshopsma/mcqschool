// =============================================
// server.js — MCQSchool Backend
// Supports: Class > Subject > Chapter (Class 1–8)
//           Class > Branch > Subject > Chapter (Class 9–12)
// =============================================

require('dotenv').config();

const express  = require('express');
const session  = require('express-session');
const { Pool } = require('pg');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// =============================================
// PostgreSQL Connection
// =============================================
const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'mcqschool',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASS     || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌  Database connection failed:', err.message);
        console.error('    Check your .env DB settings.');
    } else {
        release();
        console.log('✅  Connected to PostgreSQL database.');
    }
});

// =============================================
// Admin Credentials
// =============================================
const ADMIN_USERNAME = 'Admin';
const ADMIN_PASSWORD = '786786';

// =============================================
// Middleware
// =============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret:            process.env.SESSION_SECRET || 'mcqschool-secret',
    resave:            false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }
}));

// =============================================
// Auth Middleware
// =============================================
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin === true) return next();
    return res.status(403).json({ success: false, message: 'Unauthorized.' });
}

// =============================================
// ADMIN AUTH ROUTES
// =============================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        return res.json({ success: true });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.json({ success: true });
    });
});

app.get('/api/admin/status', (req, res) => {
    return res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// =============================================
// ROUTE: Get all available Classes
// GET /api/classes
// Returns distinct class_level values that have questions
// =============================================
app.get('/api/classes', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT DISTINCT class_level FROM questions ORDER BY class_level ASC'
        );
        return res.json({
            success: true,
            classes: result.rows.map(r => r.class_level)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Get Branches for a Class (Class 9–12)
// GET /api/branches?class=9
// =============================================
app.get('/api/branches', async (req, res) => {
    try {
        const classLevel = parseInt(req.query.class);
        if (!classLevel) return res.status(400).json({ success: false, message: 'class param required.' });

        const result = await pool.query(
            `SELECT DISTINCT branch
             FROM questions
             WHERE class_level = $1 AND branch IS NOT NULL
             ORDER BY branch ASC`,
            [classLevel]
        );
        return res.json({
            success:  true,
            branches: result.rows.map(r => r.branch)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Get Subjects
// GET /api/subjects?class=6
// GET /api/subjects?class=9&branch=Science
// =============================================
app.get('/api/subjects', async (req, res) => {
    try {
        const classLevel = parseInt(req.query.class);
        const branch     = req.query.branch || null;

        if (!classLevel) return res.status(400).json({ success: false, message: 'class param required.' });

        let result;
        if (branch) {
            result = await pool.query(
                `SELECT DISTINCT subject FROM questions
                 WHERE class_level = $1 AND branch = $2
                 ORDER BY subject ASC`,
                [classLevel, branch]
            );
        } else {
            result = await pool.query(
                `SELECT DISTINCT subject FROM questions
                 WHERE class_level = $1
                 ORDER BY subject ASC`,
                [classLevel]
            );
        }

        return res.json({
            success:  true,
            subjects: result.rows.map(r => r.subject)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Get Chapters
// GET /api/chapters?class=6&subject=Mathematics
// GET /api/chapters?class=9&branch=Science&subject=Physics
// =============================================
app.get('/api/chapters', async (req, res) => {
    try {
        const classLevel = parseInt(req.query.class);
        const branch     = req.query.branch  || null;
        const subject    = req.query.subject || null;

        if (!classLevel || !subject)
            return res.status(400).json({ success: false, message: 'class and subject params required.' });

        let result;
        if (branch) {
            result = await pool.query(
                `SELECT DISTINCT chapter FROM questions
                 WHERE class_level = $1 AND branch = $2 AND subject = $3
                 ORDER BY chapter ASC`,
                [classLevel, branch, subject]
            );
        } else {
            result = await pool.query(
                `SELECT DISTINCT chapter FROM questions
                 WHERE class_level = $1 AND subject = $2
                 ORDER BY chapter ASC`,
                [classLevel, subject]
            );
        }

        return res.json({
            success:  true,
            chapters: result.rows.map(r => r.chapter)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Get Random Questions (Quiz)
// GET /api/questions/random?class=9&branch=Science&subject=Physics&chapter=Chapter 1&count=10
// =============================================
app.get('/api/questions/random', async (req, res) => {
    try {
        const classLevel = req.query.class   ? parseInt(req.query.class) : null;
        const branch     = req.query.branch  || null;
        const subject    = req.query.subject || null;
        const chapter    = req.query.chapter || null;
        const count      = parseInt(req.query.count) || 10;

        // Build dynamic WHERE clause
        const conditions = [];
        const params     = [];
        let   i          = 1;

        if (classLevel !== null) { conditions.push(`class_level = $${i++}`); params.push(classLevel); }
        if (branch)               { conditions.push(`branch = $${i++}`);      params.push(branch);     }
        if (subject)              { conditions.push(`subject = $${i++}`);     params.push(subject);    }
        if (chapter)              { conditions.push(`chapter = $${i++}`);     params.push(chapter);    }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
        params.push(count);

        const result = await pool.query(
            `SELECT id, question, option1, option2, option3, option4, correct_answer
             FROM questions
             ${where}
             ORDER BY RANDOM()
             LIMIT $${i}`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No questions found for this selection. Ask admin to add questions.'
            });
        }

        const questions = result.rows.map(row => ({
            id:       row.id,
            question: row.question,
            options:  [row.option1, row.option2, row.option3, row.option4],
            answer:   row.correct_answer
        }));

        return res.json({ success: true, questions });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Question Count (filtered or total)
// GET /api/questions/count?class=9&branch=Science&subject=Physics&chapter=Chapter 1
// =============================================
app.get('/api/questions/count', async (req, res) => {
    try {
        const classLevel = req.query.class   ? parseInt(req.query.class) : null;
        const branch     = req.query.branch  || null;
        const subject    = req.query.subject || null;
        const chapter    = req.query.chapter || null;

        const conditions = [];
        const params     = [];
        let   i          = 1;

        if (classLevel !== null) { conditions.push(`class_level = $${i++}`); params.push(classLevel); }
        if (branch)               { conditions.push(`branch = $${i++}`);      params.push(branch);     }
        if (subject)              { conditions.push(`subject = $${i++}`);     params.push(subject);    }
        if (chapter)              { conditions.push(`chapter = $${i++}`);     params.push(chapter);    }

        const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
        const result = await pool.query(`SELECT COUNT(*) FROM questions ${where}`, params);

        return res.json({ success: true, count: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ADMIN: Get All Questions
// GET /api/questions
// =============================================
app.get('/api/questions', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM questions ORDER BY class_level ASC, branch ASC, subject ASC, chapter ASC, id DESC'
        );
        return res.json({ success: true, questions: result.rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ADMIN: Add Question
// POST /api/questions
// =============================================
app.post('/api/questions', requireAdmin, async (req, res) => {
    try {
        const {
            question, option1, option2, option3, option4,
            correct_answer, class_level, branch, subject, chapter
        } = req.body;

        if (!question || !option1 || !option2 || !option3 || !option4 ||
            !correct_answer || !class_level || !subject || !chapter) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const classNum = parseInt(class_level);
        if (classNum >= 9 && !branch) {
            return res.status(400).json({ success: false, message: 'Branch is required for Class 9 and above.' });
        }

        const opts = [option1, option2, option3, option4];
        if (!opts.includes(correct_answer)) {
            return res.status(400).json({
                success: false,
                message: 'Correct answer must exactly match one of the four options.'
            });
        }

        await pool.query(
            `INSERT INTO questions
             (question, option1, option2, option3, option4, correct_answer, class_level, branch, subject, chapter)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [question, option1, option2, option3, option4, correct_answer,
             classNum, classNum >= 9 ? branch : null, subject, chapter]
        );

        const countResult = await pool.query('SELECT COUNT(*) FROM questions');
        return res.json({
            success:    true,
            message:    'Question added.',
            totalCount: parseInt(countResult.rows[0].count)
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ADMIN: Delete Question
// DELETE /api/questions/:id
// =============================================
app.delete('/api/questions/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const check = await pool.query('SELECT id FROM questions WHERE id = $1', [id]);
        if (check.rows.length === 0)
            return res.status(404).json({ success: false, message: 'Question not found.' });

        await pool.query('DELETE FROM questions WHERE id = $1', [id]);
        const countResult = await pool.query('SELECT COUNT(*) FROM questions');

        return res.json({
            success:    true,
            totalCount: parseInt(countResult.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀  MCQSchool is running at: http://localhost:${PORT}`);
    console.log(`📋  Admin panel:              http://localhost:${PORT}/admin.html\n`);
});
