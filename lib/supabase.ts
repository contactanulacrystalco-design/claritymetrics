import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is not set in environment variables.');
}

// Create the Supabase client.
// Server-side calls will use the high-privilege service role key to manage stores, orders, and insights.
// Client-side calls (if any) will fall back to the public anonymous key.
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey
);
