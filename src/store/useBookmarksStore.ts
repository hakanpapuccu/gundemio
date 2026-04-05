import { create } from 'zustand';

type BookmarksState = {
  bookmarkIdsByUser: Record<string, string[]>;
  hydratedUsers: Record<string, boolean>;
  setBookmarks: (userId: string, articleIds: string[]) => void;
  setBookmarked: (userId: string, articleId: string, isBookmarked: boolean) => void;
};

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export const useBookmarksStore = create<BookmarksState>((set) => ({
  bookmarkIdsByUser: {},
  hydratedUsers: {},
  setBookmarks: (userId, articleIds) =>
    set((state) => ({
      bookmarkIdsByUser: {
        ...state.bookmarkIdsByUser,
        [userId]: dedupe(articleIds),
      },
      hydratedUsers: {
        ...state.hydratedUsers,
        [userId]: true,
      },
    })),
  setBookmarked: (userId, articleId, isBookmarked) =>
    set((state) => {
      const current = state.bookmarkIdsByUser[userId] ?? [];
      const currentSet = new Set(current);

      if (isBookmarked) {
        currentSet.add(articleId);
      } else {
        currentSet.delete(articleId);
      }

      return {
        bookmarkIdsByUser: {
          ...state.bookmarkIdsByUser,
          [userId]: [...currentSet],
        },
        hydratedUsers: {
          ...state.hydratedUsers,
          [userId]: true,
        },
      };
    }),
}));
