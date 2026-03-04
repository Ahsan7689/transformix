-- ══════════════════════════════════════════════════
--  TRANSFORMIX — Supabase Database Schema
--  Run this in your Supabase SQL Editor
-- ══════════════════════════════════════════════════

-- ── 1. Credits Table ──
CREATE TABLE IF NOT EXISTS public.credits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address  TEXT,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits     INTEGER NOT NULL DEFAULT 25,
  last_reset  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by IP (guest users)
CREATE INDEX IF NOT EXISTS credits_ip_idx ON public.credits (ip_address) WHERE user_id IS NULL;
-- Index for fast lookup by user_id (auth users)
CREATE INDEX IF NOT EXISTS credits_user_idx ON public.credits (user_id) WHERE user_id IS NOT NULL;

-- ── 2. Short Links Table ──
CREATE TABLE IF NOT EXISTS public.short_links (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code   TEXT NOT NULL UNIQUE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicks       INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS short_links_code_idx ON public.short_links (short_code);
CREATE INDEX IF NOT EXISTS short_links_user_idx ON public.short_links (user_id) WHERE user_id IS NOT NULL;

-- ── 3. User Profiles Table ──
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url   TEXT,
  total_ops    INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Row Level Security ──

-- Credits: anyone can read/write their own row
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credits_select" ON public.credits
  FOR SELECT USING (
    user_id = auth.uid()
    OR (user_id IS NULL)  -- guest rows accessible by anon
  );

CREATE POLICY "credits_insert" ON public.credits
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR (user_id IS NULL)
  );

CREATE POLICY "credits_update" ON public.credits
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (user_id IS NULL)
  );

-- Short links: public read for redirect, user-owned write
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "short_links_select_all" ON public.short_links
  FOR SELECT USING (true);  -- anyone can redirect

CREATE POLICY "short_links_insert" ON public.short_links
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR (user_id IS NULL)
  );

CREATE POLICY "short_links_update" ON public.short_links
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (user_id IS NULL)  -- allows click counter update
  );

CREATE POLICY "short_links_delete" ON public.short_links
  FOR DELETE USING (user_id = auth.uid());

-- User profiles: own row only
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid());

-- ── 5. Grant anon access to credits and short_links ──
GRANT SELECT, INSERT, UPDATE ON public.credits TO anon;
GRANT SELECT, INSERT, UPDATE ON public.short_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.short_links TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
