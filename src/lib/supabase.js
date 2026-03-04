import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ──────────────────────────────────────────
//  TABLE: credits
//  id, ip_address, user_id (nullable), credits, last_reset, created_at
// ──────────────────────────────────────────

// ──────────────────────────────────────────
//  TABLE: short_links
//  id, original_url, short_code, user_id (nullable), clicks, created_at
// ──────────────────────────────────────────

// ──────────────────────────────────────────
//  TABLE: user_profiles
//  id (= auth.users.id), display_name, avatar_url, total_ops, created_at
// ──────────────────────────────────────────
