import type { Article } from '../../types/article';
import { supabase } from '../supabase/client';

export async function fetchArticles(): Promise<Article[]> {
  if (!supabase) {
    return [];
  }

  // Placeholder: actual query will be implemented once DB schema is finalized.
  return [];
}
