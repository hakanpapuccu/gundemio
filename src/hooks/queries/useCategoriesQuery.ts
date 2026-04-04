import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { Category } from '../../domain/models/news';
import { listCategories } from '../../services/news';
import { newsQueryKeys } from './newsQueryKeys';

type CategoriesQueryOptions = Omit<UseQueryOptions<Category[]>, 'queryKey' | 'queryFn'>;

export function useCategoriesQuery(options?: CategoriesQueryOptions) {
  return useQuery({
    queryKey: newsQueryKeys.categories,
    queryFn: listCategories,
    ...options,
  });
}
