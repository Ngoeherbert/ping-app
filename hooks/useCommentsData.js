import {
  useComments,
  useReplies,
  getCommentState,
} from "../lib/stores/commentStore";

export function useCommentsData(postId) {
  const comments = useComments(postId);
  const { addComment, addReply, toggleLike } = getCommentState();

  return {
    comments,
    addComment,
    addReply,
    onToggleCommentLike: toggleLike,
  };
}

export function useCommentReplies(commentId) {
  return useReplies(commentId);
}
