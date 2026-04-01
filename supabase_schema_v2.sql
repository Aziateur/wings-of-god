CREATE TABLE IF NOT EXISTS public.wog_app_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    projects JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.wog_app_state DISABLE ROW LEVEL SECURITY;
INSERT INTO public.wog_app_state (id, projects, tasks) VALUES (1, '[]'::jsonb, '[]'::jsonb) ON CONFLICT (id) DO NOTHING;
