-- =============================================
-- MCQSchool Migration: Add Class/Branch/Subject/Chapter
-- Run this ONCE on Supabase SQL Editor
-- =============================================

-- Add new columns to existing questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS class_level  INTEGER  DEFAULT 1,
  ADD COLUMN IF NOT EXISTS branch       TEXT     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subject      TEXT     DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS chapter      TEXT     DEFAULT 'General';

-- Update old seed questions to a default class/subject/chapter
-- so they don't show as broken
UPDATE questions
SET class_level = 1,
    branch      = NULL,
    subject     = 'General',
    chapter     = 'General'
WHERE class_level IS NULL OR class_level = 1;

-- Optional: delete old generic seed data if you want a clean start
-- DELETE FROM questions WHERE subject = 'General';
