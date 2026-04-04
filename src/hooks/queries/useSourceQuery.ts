import { useQuery } from '@tanstack/react-query';

import { getSourceByIdentifier } from '../../services/news';
import { newsQueryKeys } from './newsQueryKeys';

export function useSourceByIdQuery(params: { sourceId: string; enabled?: boolean }) {
  return useQuery({
    queryKey: newsQueryKeys.sourceById(params.sourceId),
    queryFn: () => getSourceByIdentifier(params.sourceId),
    enabled: params.enabled ?? Boolean(params.sourceId),
  });
}
