# MCQSchool 🎓

A full-stack MCQ (Multiple Choice Question) test platform with a protected admin panel,
PostgreSQL database, and a clean quiz interface.

---

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Auth:** express-session (server-side sessions)

---

## Project Structure

```
mcqschool/
├── server.js               ← Express server + all API routes
├── package.json            ← Node.js dependencies
├── .env                    ← DB credentials & config (edit this!)
├── db/
│   └── init.sql            ← PostgreSQL schema + 10 seed questions
└── public/
    ├── index.html          ← Quiz home + quiz + result screens
    ├── admin.html          ← Admin login + question management
    ├── css/
    │   └── style.css       ← All shared styles
    └── js/
        ├── quiz.js         ← Quiz frontend logic (fetch + render)
        └── admin.js        ← Admin panel logic (login, CRUD)
```

---

## Setup Instructions

### 1. Install PostgreSQL (if not installed)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create the Database

```bash
# Login as postgres user
sudo -u postgres psql

# Inside psql:
CREATE DATABASE mcqschool;
\q
```

### 3. Run the SQL Init Script

```bash
sudo -u postgres psql -d mcqschool -f db/init.sql
```

This creates the `questions` table and seeds it with 10 sample questions.

### 4. Configure Environment Variables

Edit the `.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcqschool
DB_USER=postgres
DB_PASS=your_actual_postgres_password
SESSION_SECRET=any_long_random_string_here
```

> **Note:** If your local PostgreSQL has no password set (common on Ubuntu),
> leave `DB_PASS` empty or as `postgres`.

### 5. Install Node Dependencies

```bash
npm install
```

### 6. Start the Server

```bash
npm start
```

Or for auto-reload during development:

```bash
npm run dev
```

### 7. Open in Browser

- **Quiz:**        http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html

---

## Admin Credentials

| Username | Password |
|----------|----------|
| Admin    | 786786   |

---

## API Endpoints

| Method | Endpoint                   | Auth     | Description                        |
|--------|----------------------------|----------|------------------------------------|
| POST   | /api/admin/login           | Public   | Admin login                        |
| POST   | /api/admin/logout          | Session  | Admin logout                       |
| GET    | /api/admin/status          | Public   | Check if session is active         |
| GET    | /api/questions/random      | Public   | Get 3 random questions for quiz    |
| GET    | /api/questions/count       | Public   | Get total question count           |
| GET    | /api/questions             | Admin    | Get all questions (admin view)     |
| POST   | /api/questions             | Admin    | Add a new question                 |
| DELETE | /api/questions/:id         | Admin    | Delete a question by ID            |

---

## Features

- ✅ Random 3-question mock tests fetched live from PostgreSQL
- ✅ Answer review with correct/wrong highlighting after test
- ✅ Protected admin panel (login required)
- ✅ Admin can add new questions to the database
- ✅ Admin can delete questions
- ✅ Session-based auth (auto-login on refresh if session active)
- ✅ Question count shown on home screen
