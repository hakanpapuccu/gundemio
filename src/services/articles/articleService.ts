import type { Article } from '../../domain/models/news';
import { listArticles } from '../news/articleService';

export async function fetchArticles(): Promise<Article[]> {
  const result = await listArticles();
  return result.items;
}
