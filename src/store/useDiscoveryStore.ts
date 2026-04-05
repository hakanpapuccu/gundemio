import { create } from 'zustand';

const MAX_RECENT_SEARCHES = 8;

type DiscoveryState = {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
};

function normalizeSearch(value: string) {
  return value.trim();
}

const initialRecentSearches = ['Enflasyon verileri', 'Merkez Bankası faiz kararı'];

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  recentSearches: initialRecentSearches,
  addRecentSearch: (query) =>
    set((state) => {
      const normalized = normalizeSearch(query);
      if (normalized.length === 0) {
        return state;
      }

      const deduped = state.recentSearches.filter(
        (item) => item.toLocaleLowerCase('tr') !== normalized.toLocaleLowerCase('tr')
      );

      return {
        recentSearches: [normalized, ...deduped].slice(0, MAX_RECENT_SEARCHES),
      };
    }),
  removeRecentSearch: (query) =>
    set((state) => ({
      recentSearches: state.recentSearches.filter(
        (item) => item.toLocaleLowerCase('tr') !== query.toLocaleLowerCase('tr')
      ),
    })),
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
