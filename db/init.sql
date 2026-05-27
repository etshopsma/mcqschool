-- =============================================
-- MCQSchool Database Setup Script
-- Run this once to create the database schema
-- and seed it with sample questions.
-- =============================================

-- Create the database (run this separately if needed):
-- CREATE DATABASE mcqschool;

-- Connect to the mcqschool database before running below:
-- \c mcqschool

-- =============================================
-- TABLE: questions
-- =============================================
CREATE TABLE IF NOT EXISTS questions (
    id             SERIAL PRIMARY KEY,
    question       TEXT        NOT NULL,
    option1        TEXT        NOT NULL,
    option2        TEXT        NOT NULL,
    option3        TEXT        NOT NULL,
    option4        TEXT        NOT NULL,
    correct_answer TEXT        NOT NULL,
    created_at     TIMESTAMP   DEFAULT NOW()
);

-- =============================================
-- SEED DATA: 10 sample questions
-- =============================================
INSERT INTO questions (question, option1, option2, option3, option4, correct_answer) VALUES
(
    'What is the capital of Bangladesh?',
    'Dhaka', 'Khulna', 'Rajshahi', 'Sylhet',
    'Dhaka'
),
(
    'Which language runs in the browser?',
    'Python', 'Java', 'JavaScript', 'C++',
    'JavaScript'
),
(
    'HTML stands for?',
    'Hyper Text Markup Language',
    'High Transfer Machine Language',
    'Home Tool Markup Language',
    'Hyperlink Text Main Language',
    'Hyper Text Markup Language'
),
(
    'CSS is mainly used for?',
    'Styling', 'Database', 'Hosting', 'Backend',
    'Styling'
),
(
    'Which company created JavaScript?',
    'Google', 'Netscape', 'Apple', 'Microsoft',
    'Netscape'
),
(
    'Which symbol is used for ID selector in CSS?',
    '#', '.', '$', '@',
    '#'
),
(
    'Which keyword creates a variable in modern JavaScript?',
    'let', 'create', 'make', 'build',
    'let'
),
(
    'DOM stands for?',
    'Document Object Model',
    'Data Object Management',
    'Desktop Order Model',
    'Document Order Method',
    'Document Object Model'
),
(
    'Which event fires on clicking an element?',
    'hover', 'change', 'click', 'submit',
    'click'
),
(
    'Which method selects an element by its ID?',
    'querySelectorAll',
    'getElementById',
    'findElement',
    'selectElement',
    'getElementById'
);
