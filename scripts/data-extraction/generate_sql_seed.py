import json
import os

data_path = r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\src\data\striver_dataset.json'
sql_path = r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\supabase\migrations\20261102000000_init_schema_and_seed.sql'

with open(data_path, 'r', encoding='utf-8') as f:
    dataset = json.load(f)

modules = dataset['modules']
subtopics = dataset['subtopics']
problems = dataset['problems']

lines = []
lines.append("-- Striver's A2Z DSA Sheet Tracker - PostgreSQL & Supabase Schema")
lines.append("-- Generated: 2026-11-02\n")

lines.append("""-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Modules Table
CREATE TABLE IF NOT EXISTS public.modules (
    module_id TEXT PRIMARY KEY,
    module_number INTEGER NOT NULL,
    module_name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    display_order INTEGER NOT NULL
);

-- 2. Subtopics Table
CREATE TABLE IF NOT EXISTS public.subtopics (
    subtopic_id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES public.modules(module_id) ON DELETE CASCADE,
    subtopic_name TEXT NOT NULL,
    slug TEXT,
    display_order INTEGER NOT NULL
);

-- 3. Problems Table
CREATE TABLE IF NOT EXISTS public.problems (
    problem_id TEXT PRIMARY KEY,
    raw_id INTEGER,
    module_id TEXT NOT NULL REFERENCES public.modules(module_id) ON DELETE CASCADE,
    subtopic_id TEXT NOT NULL REFERENCES public.subtopics(subtopic_id) ON DELETE CASCADE,
    problem_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    striver_tier TEXT CHECK (striver_tier IN ('basic', 'core', 'pro')),
    platform TEXT NOT NULL,
    primary_url TEXT NOT NULL,
    alternate_urls JSONB DEFAULT '[]'::jsonb,
    source_url TEXT,
    video_url TEXT,
    duration TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER NOT NULL
);

-- 4. User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    problem_id TEXT NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'unsolved' CHECK (status IN ('unsolved', 'attempting', 'solved')),
    is_bookmarked BOOLEAN NOT NULL DEFAULT false,
    personal_notes TEXT,
    solved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_problem UNIQUE (user_id, problem_id)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_problems_module ON public.problems(module_id);
CREATE INDEX IF NOT EXISTS idx_problems_subtopic ON public.problems(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_problems_platform ON public.problems(platform);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_solved_at ON public.user_progress(solved_at);

-- Row Level Security (RLS)
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Read policies for public reference data
CREATE POLICY "Public read modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Public read subtopics" ON public.subtopics FOR SELECT USING (true);
CREATE POLICY "Public read problems" ON public.problems FOR SELECT USING (true);

-- User-specific policies for user_progress
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON public.user_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Seed Data
""")

def sql_esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

for m in modules:
    lines.append(f"INSERT INTO public.modules (module_id, module_number, module_name, slug, description, display_order) VALUES ({sql_esc(m['module_id'])}, {m['module_number']}, {sql_esc(m['module_name'])}, {sql_esc(m['slug'])}, {sql_esc(m['description'])}, {m['display_order']}) ON CONFLICT (module_id) DO NOTHING;")

for s in subtopics:
    lines.append(f"INSERT INTO public.subtopics (subtopic_id, module_id, subtopic_name, slug, display_order) VALUES ({sql_esc(s['subtopic_id'])}, {sql_esc(s['module_id'])}, {sql_esc(s['subtopic_name'])}, {sql_esc(s['slug'])}, {s['display_order']}) ON CONFLICT (subtopic_id) DO NOTHING;")

for p in problems:
    alt_json = json.dumps(p.get('alternate_urls', []))
    tags_json = json.dumps(p.get('tags', []))
    lines.append(f"INSERT INTO public.problems (problem_id, raw_id, module_id, subtopic_id, problem_number, title, slug, difficulty, striver_tier, platform, primary_url, alternate_urls, source_url, video_url, duration, tags, display_order) VALUES ({sql_esc(p['problem_id'])}, {p['raw_id']}, {sql_esc(p['module_id'])}, {sql_esc(p['subtopic_id'])}, {p['problem_number']}, {sql_esc(p['title'])}, {sql_esc(p['slug'])}, {sql_esc(p['difficulty'])}, {sql_esc(p['striver_tier'])}, {sql_esc(p['platform'])}, {sql_esc(p['primary_url'])}, {sql_esc(alt_json)}::jsonb, {sql_esc(p['source_url'])}, {sql_esc(p['video_url'])}, {sql_esc(p['duration'])}, {sql_esc(tags_json)}::jsonb, {p['display_order']}) ON CONFLICT (problem_id) DO NOTHING;")

with open(sql_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(lines))

print(f"Generated SQL seed file at {sql_path}, size: {os.path.getsize(sql_path)} bytes")
