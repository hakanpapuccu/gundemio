import type { PostgrestError } from '@supabase/supabase-js';

import { hasSupabaseConfig } from '../supabase/client';

const BACKEND_INCOMPLETE_ERROR_CODES = new Set(['42P01', '42703', '42883']);

export function shouldUseMockFallback(error: PostgrestError | null) {
  if (!hasSupabaseConfig) {
    return true;
  }

  if (!error) {
    return false;
  }

  return BACKEND_INCOMPLETE_ERROR_CODES.has(error.code);
}

export function logMockFallback(context: string, error: PostgrestError | null) {
  if (!__DEV__ || !error || !shouldUseMockFallback(error)) {
    return;
  }

  console.warn(`[mock-fallback:${context}] ${error.code} ${error.message}`);
}
