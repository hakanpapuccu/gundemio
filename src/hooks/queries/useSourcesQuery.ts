import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { PaginatedResult, Source } from '../../domain/models/news';
import { listSources, type ListSourcesParams } from '../../services/news';
import { newsQueryKeys } from './newsQueryKeys';

type SourcesQueryOptions = Omit<UseQueryOptions<PaginatedResult<Source>>, 'queryKey' | 'queryFn'>;

export function useSourcesQuery(params: ListSourcesParams = {}, options?: SourcesQueryOptions) {
  return useQuery({
    queryKey: newsQueryKeys.sources(params),
    queryFn: () => listSources(params),
    ...options,
  });
}
