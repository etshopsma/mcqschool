// =============================================
// server.js — Main Express Application
// MCQSchool Backend Server
// =============================================

require('dotenv').config();

const express        = require('express');
const session        = require('express-session');
const { Pool }       = require('pg');
const path           = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// =============================================
// PostgreSQL Connection Pool
// =============================================
const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'mcqschool',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASS     || '',
});

// Test DB connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌  Database connection failed:', err.message);
        console.error('    Please check your .env DB settings and ensure PostgreSQL is running.');
    } else {
        release();
        console.log('✅  Connected to PostgreSQL database.');
    }
});

// =============================================
// Admin Credentials (hardcoded as required)
// =============================================
const ADMIN_USERNAME = 'Admin';
const ADMIN_PASSWORD = '786786';

// =============================================
// Middleware
// =============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret:            process.env.SESSION_SECRET || 'mcqschool-default-secret',
    resave:            false,
    saveUninitialized: false,
    cookie: {
        secure:   false,       // set true if using HTTPS in production
        httpOnly: true,
        maxAge:   1000 * 60 * 60  // 1 hour session lifetime
    }
}));

// =============================================
// Auth Middleware — protects admin-only routes
// =============================================
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin === true) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin login required.'
    });
}

// =============================================
// ROUTE: Admin Login
// POST /api/admin/login
// Body: { username, password }
// =============================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        return res.json({ success: true, message: 'Login successful.' });
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
    });
});

// =============================================
// ROUTE: Admin Logout
// POST /api/admin/logout
// =============================================
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: 'Logged out successfully.' });
    });
});

// =============================================
// ROUTE: Check Admin Auth Status
// GET /api/admin/status
// Returns whether the current session is admin
// =============================================
app.get('/api/admin/status', (req, res) => {
    return res.json({
        isAdmin: !!(req.session && req.session.isAdmin)
    });
});

// =============================================
// ROUTE: Get Random Questions (Public)
// GET /api/questions/random?count=3
// Used by the quiz to load a test
// =============================================
app.get('/api/questions/random', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 3;

        const result = await pool.query(
            `SELECT id, question, option1, option2, option3, option4, correct_answer
             FROM questions
             ORDER BY RANDOM()
             LIMIT $1`,
            [count]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No questions found in the database. Please ask the admin to add questions.'
            });
        }

        // Format for frontend consumption
        const questions = result.rows.map(row => ({
            id:      row.id,
            question: row.question,
            options: [row.option1, row.option2, row.option3, row.option4],
            answer:  row.correct_answer
        }));

        return res.json({ success: true, questions });

    } catch (err) {
        console.error('Error fetching random questions:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Get Total Question Count (Public)
// GET /api/questions/count
// =============================================
app.get('/api/questions/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM questions');
        return res.json({
            success: true,
            count: parseInt(result.rows[0].count)
        });
    } catch (err) {
        console.error('Error fetching question count:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Get All Questions (Admin Only)
// GET /api/questions
// Returns full list for admin management view
// =============================================
app.get('/api/questions', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM questions ORDER BY id DESC'
        );
        return res.json({ success: true, questions: result.rows });
    } catch (err) {
        console.error('Error fetching all questions:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Add a New Question (Admin Only)
// POST /api/questions
// Body: { question, option1, option2, option3, option4, correct_answer }
// =============================================
app.post('/api/questions', requireAdmin, async (req, res) => {
    try {
        const {
            question,
            option1, option2, option3, option4,
            correct_answer
        } = req.body;

        // Validate all fields present
        if (!question || !option1 || !option2 || !option3 || !option4 || !correct_answer) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        // Validate correct_answer is one of the options
        const opts = [option1, option2, option3, option4];
        if (!opts.includes(correct_answer)) {
            return res.status(400).json({
                success: false,
                message: 'Correct answer must exactly match one of the four options.'
            });
        }

        const result = await pool.query(
            `INSERT INTO questions (question, option1, option2, option3, option4, correct_answer)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [question, option1, option2, option3, option4, correct_answer]
        );

        const countResult = await pool.query('SELECT COUNT(*) FROM questions');

        return res.json({
            success:    true,
            message:    'Question added successfully.',
            id:         result.rows[0].id,
            totalCount: parseInt(countResult.rows[0].count)
        });

    } catch (err) {
        console.error('Error adding question:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// ROUTE: Delete a Question (Admin Only)
// DELETE /api/questions/:id
// =============================================
app.delete('/api/questions/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const check = await pool.query('SELECT id FROM questions WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }

        await pool.query('DELETE FROM questions WHERE id = $1', [id]);

        const countResult = await pool.query('SELECT COUNT(*) FROM questions');

        return res.json({
            success:    true,
            message:    'Question deleted successfully.',
            totalCount: parseInt(countResult.rows[0].count)
        });

    } catch (err) {
        console.error('Error deleting question:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// =============================================
// Fallback: serve index.html for any unknown route
// =============================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================================
// Start Server
// =============================================
app.listen(PORT, () => {
    console.log(`\n🚀  MCQSchool is running at: http://localhost:${PORT}`);
    console.log(`📋  Admin panel:              http://localhost:${PORT}/admin.html\n`);
});
