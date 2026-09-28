import { create } from "zustand";
import { COMMENTS, COMMENT_REPLIES } from "../mockData";

const store = create((set) => ({
  comments: COMMENTS,
  replies: COMMENT_REPLIES,

  addComment: (postId, comment) => {
    const newComment = {
      id: `c-${Date.now()}`,
      postId,
      ...comment,
    };
    set((state) => ({
      comments: [...state.comments, newComment],
    }));
  },

  addReply: (commentId, reply) => {
    const newReply = {
      id: `cr-${Date.now()}`,
      commentId,
      ...reply,
    };
    set((state) => ({
      replies: [...state.replies, newReply],
    }));
  },
}));

export const { getState: getCommentState } = store;

export function useComments(postId) {
  return store((state) =>
    postId ? state.comments.filter((c) => c.postId === postId) : state.comments
  );
}

export function useReplies(commentId) {
  return store((state) =>
    commentId
      ? state.replies.filter((r) => r.commentId === commentId)
      : state.replies
  );
}
