-- ============================================================
-- RGA Qualification System — Supabase Database Schema
-- الهيئة العامة للطرق — قاعدة بيانات نظام التأهيل
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: candidates
-- ============================================================
CREATE TABLE IF NOT EXISTS candidates (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name    TEXT NOT NULL,
  company      TEXT NOT NULL,
  id_number    TEXT NOT NULL,
  phone        TEXT NOT NULL,
  specialty    TEXT NOT NULL,
  certificates TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for search
CREATE INDEX IF NOT EXISTS idx_candidates_full_name ON candidates (full_name);
CREATE INDEX IF NOT EXISTS idx_candidates_company ON candidates (company);
CREATE INDEX IF NOT EXISTS idx_candidates_specialty ON candidates (specialty);

-- ============================================================
-- Table: results
-- ============================================================
CREATE TABLE IF NOT EXISTS results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  score           INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  earned_points   INTEGER NOT NULL,
  total_points    INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers   INTEGER NOT NULL,
  passed          BOOLEAN NOT NULL,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_results_candidate_id ON results (candidate_id);
CREATE INDEX IF NOT EXISTS idx_results_submitted_at ON results (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_passed ON results (passed);

-- ============================================================
-- Table: exam_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id       UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  selected_answer INTEGER,
  correct_answer  INTEGER NOT NULL,
  is_correct      BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exam_answers_result_id ON exam_answers (result_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;

-- Policy: anyone (anonymous) can INSERT candidates + results + answers
-- (needed for the public exam form)
CREATE POLICY "allow_anon_insert_candidates" ON candidates
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert_results" ON results
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert_exam_answers" ON exam_answers
  FOR INSERT TO anon WITH CHECK (true);

-- Policy: only authenticated admins can SELECT / DELETE
CREATE POLICY "allow_auth_select_candidates" ON candidates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_auth_select_results" ON results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_auth_select_exam_answers" ON exam_answers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_auth_delete_results" ON results
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "allow_auth_delete_exam_answers" ON exam_answers
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "allow_auth_delete_candidates" ON candidates
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Useful Views
-- ============================================================

CREATE OR REPLACE VIEW v_results_full AS
SELECT
  r.id,
  r.score,
  r.earned_points,
  r.total_points,
  r.correct_answers,
  r.wrong_answers,
  r.passed,
  r.submitted_at,
  c.full_name,
  c.company,
  c.id_number,
  c.phone,
  c.specialty,
  c.certificates
FROM results r
JOIN candidates c ON r.candidate_id = c.id
ORDER BY r.submitted_at DESC;
