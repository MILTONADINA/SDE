import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

/** Typed Supabase client — all queries infer column types from generated schema */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
