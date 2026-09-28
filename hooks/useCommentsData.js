import {
  useComments,
  useReplies,
  getCommentState,
} from "../lib/stores/commentStore";

export function useCommentsData(postId) {
  const comments = useComments(postId);

  return {
    comments,
    addComment: getCommentState().addComment,
  };
}

export function useCommentReplies(commentId) {
  return useReplies(commentId);
}
