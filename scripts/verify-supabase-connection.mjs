import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

function readFromDotEnv(key) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return '';
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }
    const currentKey = trimmed.slice(0, separatorIndex);
    if (currentKey !== key) {
      continue;
    }
    return trimmed.slice(separatorIndex + 1).trim();
  }

  return '';
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || readFromDotEnv('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || readFromDotEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing env values. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before running this check.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { error: authError } = await supabase.auth.getSession();

if (authError) {
  console.error('Supabase auth ping failed:', authError.message);
  process.exit(1);
}

const { error: tableError, count } = await supabase
  .from('categories')
  .select('id', { count: 'exact', head: true })
  .limit(1);

if (!tableError) {
  console.log(`Supabase connection OK. categories count (exact): ${count ?? 0}`);
  process.exit(0);
}

if (tableError.code === '42P01') {
  console.log(
    'Supabase connection OK, but categories table is missing. This is acceptable while backend schema is still incomplete.'
  );
  process.exit(0);
}

console.error('Supabase query check failed:', `${tableError.code ?? 'UNKNOWN'} ${tableError.message}`);
process.exit(1);
