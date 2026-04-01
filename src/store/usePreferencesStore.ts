import { create } from 'zustand';

type PreferencesState = {
  selectedCategoryIds: string[];
  selectedSourceIds: string[];
  toggleCategory: (categoryId: string) => void;
  toggleSource: (sourceId: string) => void;
  reset: () => void;
};

const toggle = (current: string[], id: string) =>
  current.includes(id) ? current.filter((value) => value !== id) : [...current, id];

const initialState = {
  selectedCategoryIds: [],
  selectedSourceIds: [],
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  ...initialState,
  toggleCategory: (categoryId) =>
    set((state) => ({
      selectedCategoryIds: toggle(state.selectedCategoryIds, categoryId),
    })),
  toggleSource: (sourceId) =>
    set((state) => ({
      selectedSourceIds: toggle(state.selectedSourceIds, sourceId),
    })),
  reset: () => set(initialState),
}));
