import { createClient } from '@supabase/supabase-js'

// These values come from your environment variables set in Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Anon Key:", supabaseAnonKey)

// Create a single Supabase client for use in your app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
