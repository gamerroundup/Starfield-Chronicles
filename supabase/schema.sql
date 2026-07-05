-- Supabase / PostgreSQL Schema Setup for Starfield Chronicles

CREATE TYPE character_visibility AS ENUM ('private', 'unlisted', 'public');

-- 1. Characters Table
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    background TEXT NOT NULL,
    traits TEXT NOT NULL,
    current_level INT DEFAULT 1,
    biography_summary TEXT DEFAULT '',
    visibility character_visibility DEFAULT 'private',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- 2. Timeline Events Table
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    level INT NOT NULL,
    event_title TEXT NOT NULL,
    event_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- 3. Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    player_input TEXT NOT NULL,
    ai_generated_log TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- 4. Daily Slates Table
CREATE TABLE IF NOT EXISTS public.daily_slates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    global_news_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.daily_slates ENABLE ROW LEVEL SECURITY;

-- 5. Mods Table
CREATE TABLE IF NOT EXISTS public.mods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    download_url TEXT NOT NULL,
    release_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.mods ENABLE ROW LEVEL SECURITY;

-- 6. SSNN Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies Setup

-- Characters policies
CREATE POLICY "Public characters are viewable by everyone" ON public.characters
    FOR SELECT USING (visibility = 'public' OR visibility = 'unlisted' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own characters" ON public.characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" ON public.characters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters" ON public.characters
    FOR DELETE USING (auth.uid() = user_id);

-- Timeline events policies
CREATE POLICY "Timeline events are viewable if character is viewable" ON public.timeline_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.characters 
            WHERE id = timeline_events.character_id 
            AND (visibility = 'public' OR visibility = 'unlisted' OR auth.uid() = user_id)
        )
    );

CREATE POLICY "Users can insert timeline events for their own characters" ON public.timeline_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.characters 
            WHERE id = timeline_events.character_id AND auth.uid() = user_id
        )
    );

-- Journal entries policies
CREATE POLICY "Journal entries are viewable if character is viewable" ON public.journal_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.characters 
            WHERE id = journal_entries.character_id 
            AND (visibility = 'public' OR visibility = 'unlisted' OR auth.uid() = user_id)
        )
    );

CREATE POLICY "Users can insert journal entries for their own characters" ON public.journal_entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.characters 
            WHERE id = journal_entries.character_id AND auth.uid() = user_id
        )
    );

-- Daily slates policies
CREATE POLICY "Daily slates are viewable by everyone" ON public.daily_slates
    FOR SELECT TO public USING (true);

-- Mods policies
CREATE POLICY "Mods are viewable by everyone" ON public.mods
    FOR SELECT TO public USING (true);

-- Announcements policies
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements
    FOR SELECT TO public USING (true);

-- Restrict write access for daily_slates, mods and announcements to admin
CREATE POLICY "Only admin can write mods" ON public.mods
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@gamerroundup.com');

CREATE POLICY "Only admin can write announcements" ON public.announcements
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@gamerroundup.com');

CREATE POLICY "Anyone or API key can write daily slates" ON public.daily_slates
    FOR ALL USING (true);
