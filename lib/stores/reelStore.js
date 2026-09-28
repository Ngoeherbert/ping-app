import { create } from "zustand";
import { REELS } from "../mockData";

const store = create((set) => ({
  reels: REELS,
  currentIndex: 0,

  nextReel: () => {
    set((state) => ({
      currentIndex:
        state.currentIndex < state.reels.length - 1
          ? state.currentIndex + 1
          : state.currentIndex,
    }));
  },

  prevReel: () => {
    set((state) => ({
      currentIndex: state.currentIndex > 0 ? state.currentIndex - 1 : 0,
    }));
  },

  likeReel: (reelId) => {
    set((state) => ({
      reels: state.reels.map((r) =>
        r.id === reelId
          ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
          : r
      ),
    }));
  },

  saveReel: (reelId) => {
    set((state) => ({
      reels: state.reels.map((r) =>
        r.id === reelId ? { ...r, isSaved: !r.isSaved } : r
      ),
    }));
  },

  setCurrentIndex: (index) => {
    set({ currentIndex: index });
  },
}));

export const { getState: getReelState } = store;

export function useReels() {
  return store((state) => state.reels);
}

export function useCurrentReel() {
  return store((state) => {
    const { reels, currentIndex } = state;
    return reels[currentIndex] ?? null;
  });
}

export function useReelCurrentIndex() {
  return store((state) => state.currentIndex);
}
