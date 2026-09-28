import { useLikes, getLikeState } from "../lib/stores/likeStore";

export function useLikesData(postId) {
  const likes = useLikes(postId);

  return {
    likes,
    toggleLike: getLikeState().toggleLike,
  };
}
