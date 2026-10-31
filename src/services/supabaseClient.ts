import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://tcbozysbacuoaewzoviq.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjYm96eXNiYWN1b2Fld3pvdmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTYxNTMsImV4cCI6MjEwODk5MjE1M30.mEsHpCr69a1jWgUz20L8ct1TB-5hC8jYP6Cw5MtHTn8';

// Create Supabase Client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper to test connectivity
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { error } = await supabase.from('website_settings').select('count', { count: 'exact', head: true });
    if (error && error.code === 'PGRST205') {
      // Table doesn't exist yet, but connection to Supabase endpoint succeeded
      return { connected: true, message: 'Connected to Supabase (Schema initialization pending in SQL Editor).' };
    }
    if (error && error.code !== 'PGRST116') {
      return { connected: true, message: `Connected to Supabase (Notice: ${error.message})` };
    }
    return { connected: true, message: 'Connected to Supabase PostgreSQL database successfully.' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Failed to reach Supabase endpoint.' };
  }
}
