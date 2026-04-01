export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '',
} as const;
