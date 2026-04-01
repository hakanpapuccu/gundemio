export type ArticleCategory =
  | 'general'
  | 'technology'
  | 'business'
  | 'science'
  | 'sports'
  | 'health'
  | 'entertainment';

export type Article = {
  id: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  sourceName: string;
  category: ArticleCategory;
  publishedAt: string;
  link: string;
  isSaved: boolean;
};
