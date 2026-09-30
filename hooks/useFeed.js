import { usePings, useLoadingMore, useRefreshing, getPingState } from "../lib/stores/pingStore";

export function useFeed() {
  const pings = usePings();
  const loadingMore = useLoadingMore();
  const refreshing = useRefreshing();

  const onEndReached = () => {
    if (loadingMore) return;
    getPingState().fetchMore(pings.length);
  };

  const onRefresh = () => {
    getPingState().refresh();
  };

  return {
    pings,
    loadingMore,
    refreshing,
    onEndReached,
    onRefresh,
    onCreatePing: getPingState().postPing,
  };
}
