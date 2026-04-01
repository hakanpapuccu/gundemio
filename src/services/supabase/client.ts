import { createClient } from '@supabase/supabase-js';

import type { Database } from '../../types/supabase';
import { env } from '../../utils/env';

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);

if (!hasSupabaseConfig && __DEV__) {
  console.warn(
    'Supabase env values are missing. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.'
  );
}

export const supabase = hasSupabaseConfig
  ? createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
