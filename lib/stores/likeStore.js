import { create } from "zustand";
import { LIKES } from "../mockData";

const store = create((set) => ({
  likes: LIKES,

  toggleLike: (postId, userId) => {
    set((state) => {
      const existing = state.likes.find(
        (l) => l.postId === postId && l.userId === userId
      );
      if (existing) {
        return {
          likes: state.likes.filter((l) => l.id !== existing.id),
        };
      }
      return {
        likes: [
          ...state.likes,
          {
            id: `lk-${Date.now()}`,
            postId,
            userId,
            user: "You",
            avatar: null,
            text: "liked your ping",
            time: "now",
            reaction: "❤️",
            read: false,
          },
        ],
      };
    });
  },
}));

export const { getState: getLikeState } = store;

export function useLikes(postId) {
  return store((state) =>
    postId ? state.likes.filter((l) => l.postId === postId) : state.likes
  );
}
