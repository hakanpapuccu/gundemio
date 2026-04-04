import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggleFavorite, upsertUserPreferences, type ToggleFavoriteInput, type UpsertPreferencesInput } from '../../services/news';
import { newsQueryKeys } from './newsQueryKeys';

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ToggleFavoriteInput) => toggleFavorite(input),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['news', 'articles'] }),
        queryClient.invalidateQueries({ queryKey: ['news', 'favorites', variables.userId] }),
      ]);
    },
  });
}

export function useUpsertPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertPreferencesInput) => upsertUserPreferences(input),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: newsQueryKeys.preferences(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: ['news', 'articles'] }),
      ]);
    },
  });
}
