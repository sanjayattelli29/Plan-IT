import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mxlnntciyijnjauccmab.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14bG5udGNpeWlqbmphdWNjbWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzA0MDYsImV4cCI6MjA3Nzc0NjQwNn0.0FfyCvFp3TYTTSfB-kIVZZ7EEXsWkw8E5KF9epz5LSM";



export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});