import { create } from "zustand";
import { useMemo } from "react";
import { COMMENTS, COMMENT_REPLIES } from "../mockData";

/**
 * Flips `liked` and keeps `likes` in step, returning the same object reference
 * when the id doesn't match so untouched rows don't re-render.
 */
function withToggledLike(item, id) {
  if (item.id !== id) return item;
  return {
    ...item,
    liked: !item.liked,
    likes: Math.max(0, (item.likes ?? 0) + (item.liked ? -1 : 1)),
  };
}

const store = create((set) => ({
  comments: COMMENTS,
  replies: COMMENT_REPLIES,

  addComment: (postId, comment) => {
    const newComment = {
      id: `c-${Date.now()}`,
      postId,
      time: "now",
      likes: 0,
      liked: false,
      replies: 0,
      ...comment,
    };
    set((state) => ({ comments: [...state.comments, newComment] }));
  },

  addReply: (commentId, reply) => {
    const newReply = {
      id: `cr-${Date.now()}`,
      commentId,
      time: "now",
      likes: 0,
      liked: false,
      ...reply,
    };
    set((state) => ({ replies: [...state.replies, newReply] }));
  },

  // Comments and replies share the id/likes/liked shape, so one toggle covers both.
  toggleLike: (id) =>
    set((state) => ({
      comments: state.comments.map((c) => withToggledLike(c, id)),
      replies: state.replies.map((r) => withToggledLike(r, id)),
    })),
}));

export const { getState: getCommentState } = store;

// Select the raw array and filter OUTSIDE the selector: zustand compares the
// snapshot by identity, so returning a fresh array from the selector itself
// would re-render forever.
export function useComments(postId) {
  const all = store((state) => state.comments);
  return useMemo(
    () => (postId ? all.filter((c) => c.postId === postId) : all),
    [all, postId]
  );
}

export function useReplies(commentId) {
  const all = store((state) => state.replies);
  return useMemo(
    () => (commentId ? all.filter((r) => r.commentId === commentId) : all),
    [all, commentId]
  );
}
