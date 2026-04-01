-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS public.wog_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    end_goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Axes Table
CREATE TABLE IF NOT EXISTS public.wog_axes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.wog_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL
);

-- 3. Create Stages Table
CREATE TABLE IF NOT EXISTS public.wog_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.wog_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    gate_condition TEXT,
    gate_target TEXT
);

-- 4. Create Sub-Milestones Table
CREATE TABLE IF NOT EXISTS public.wog_sub_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID REFERENCES public.wog_stages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL
);

-- 5. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.wog_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.wog_projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.wog_stages(id) ON DELETE CASCADE,
    sub_milestone_id UUID REFERENCES public.wog_sub_milestones(id) ON DELETE SET NULL,
    axis_id UUID REFERENCES public.wog_axes(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    due_date TEXT,
    depends_on TEXT,
    is_expanded BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create Subtasks Table
CREATE TABLE IF NOT EXISTS public.wog_subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.wog_tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

-- 7. Create Problem Logs Table
CREATE TABLE IF NOT EXISTS public.wog_problem_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.wog_projects(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Note: Since this is for a local single-user tool, we leave RLS disabled or allow all.
-- Allowing all operations for now (if RLS is enabled on the database level).
ALTER TABLE public.wog_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wog_axes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wog_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wog_sub_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wog_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wog_subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wog_problem_logs DISABLE ROW LEVEL SECURITY;
