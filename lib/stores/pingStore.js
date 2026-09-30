import { create } from "zustand";
import { getBasePings, generatePings } from "../mockData";

const PAGE_SIZE = 5;

const usePingStoreBase = create((set) => ({
  pings: getBasePings(),
  loadingMore: false,
  refreshing: false,

  fetchMore: (offset) => {
    set((state) => {
      if (state.loadingMore) return state;
      return { loadingMore: true };
    });

    setTimeout(() => {
      const newPings = generatePings(offset, PAGE_SIZE);
      set((state) => ({
        pings: [...state.pings, ...newPings],
        loadingMore: false,
      }));
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
