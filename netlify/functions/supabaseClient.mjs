// src/supabaseClient.mjs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL または Key が設定されていません');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
