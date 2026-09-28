import {
  useReels,
  useCurrentReel,
  useReelCurrentIndex,
  getReelState,
} from "../lib/stores/reelStore";

export function useReelsData() {
  const reels = useReels();
  const currentReel = useCurrentReel();
  const currentIndex = useReelCurrentIndex();

  return {
    reels,
    currentReel,
    currentIndex,
    nextReel: getReelState().nextReel,
    prevReel: getReelState().prevReel,
    likeReel: getReelState().likeReel,
    saveReel: getReelState().saveReel,
    setCurrentIndex: getReelState().setCurrentIndex,
  };
}
