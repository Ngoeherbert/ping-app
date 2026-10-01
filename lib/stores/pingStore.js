import { create } from "zustand";
import { getBasePings, generatePings } from "../mockData";

const PAGE_SIZE = 5;

const usePingStoreBase = create((set, get) => ({
  pings: getBasePings(),
  loadingMore: false,
  refreshing: false,

  fetchMore: (offset) => {
    // Guard BEFORE scheduling: double scroll events used to append the same
    // generated batch twice (duplicate keys like `gen-28`).
    if (get().loadingMore) return;
    set({ loadingMore: true });

    setTimeout(() => {
      const newPings = generatePings(offset, PAGE_SIZE);
      set((state) => {
        // Belt & braces: never append a ping whose id is already in the feed.
        const seen = new Set(state.pings.map((p) => p.id));
        return {
          pings: [...state.pings, ...newPings.filter((p) => !seen.has(p.id))],
          loadingMore: false,
        };
      });
    }, 800);
  },

  refresh: () => {
    set({ refreshing: true });
    setTimeout(() => {
      set({
        pings: getBasePings(),
        refreshing: false,
      });
    }, 1000);
  },

  // Adds a ping the signed-in user just created — it leads the Home feed.
  postPing: (ping) => {
    set((state) => ({ pings: [ping, ...state.pings] }));
  },

  reset: () => {
    set({
      pings: getBasePings(),
      loadingMore: false,
      refreshing: false,
    });
  },
}));

export function usePings() {
  return usePingStoreBase((state) => state.pings);
}

export function useLoadingMore() {
  return usePingStoreBase((state) => state.loadingMore);
}

export function useRefreshing() {
  return usePingStoreBase((state) => state.refreshing);
}

export const { getState: getPingState } = usePingStoreBase;
export const fetchPingsMore = getPingState().fetchMore;
export const refreshPings = getPingState().refresh;
