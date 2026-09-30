import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import SlideUpModal from "../ui/SlideUpModal";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import VerifiedBadge from "../ui/VerifiedBadge";
import { palette } from "../../constants/colors";
import { getComments, getCommentReplies, getProfileById } from "../../lib/mockData";

const CommentModal = forwardRef(function CommentModal(
  { postId, onClose, onPostComment },
  ref
) {
  const [commentText, setCommentText] = useState("");
  const comments = postId ? getComments(postId) : [];

  const handleSubmit = useCallback(() => {
    if (!commentText.trim() || !postId) return;
    onPostComment?.(postId, commentText.trim());
    setCommentText("");
  }, [commentText, postId, onPostComment]);

  return (
    <SlideUpModal
      ref={ref}
      title="Comments"
      onClose={onClose}
      snapPoints={["50%", "75%"]}
      showCloseButton
    >
      {comments.map((comment) => {
        const profile = getProfileById(comment.userId);
        const isVerified = profile?.verified || comment.verified;
        const verifiedVariant = profile?.verifiedVariant || comment.verifiedVariant || "blue";

        return (
          <View key={comment.id} style={styles.commentContainer}>
            <View style={styles.commentAvatar}>
              <Avatar uri={comment.avatar || profile?.avatar} name={comment.user} size={36} />
            </View>
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                {isVerified && <VerifiedBadge variant={verifiedVariant} size={14} inline />}
                <Text style={styles.commentHandle}>{comment.handle}</Text>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
              <CommentReplies commentId={comment.id} />
              <View style={styles.commentFooter}>
                <Text style={styles.commentTime}>{comment.time}</Text>
                <Pressable
                  style={styles.commentAction}
                  accessibilityRole="button"
                  accessibilityLabel={`Like comment`}
                >
                  <Icon name="heart" size={16} color={palette.muted} />
                  <Text style={styles.commentActionText}>{comment.likes}</Text>
                </Pressable>
                <Text style={styles.commentActionText}>Reply</Text>
              </View>
            </View>
          </View>
        );
      })}

      <View style={styles.inputRow}>
        <Avatar uri="https://picsum.photos/seed/me/120/120" name="You" size={32} />
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor={palette.muted}
          value={commentText}
          onChangeText={setCommentText}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Pressable
          style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={!commentText.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send comment"
        >
          <Icon
            name="send"
            size={20}
            color={commentText.trim() ? palette.primary : palette.muted}
          />
        </Pressable>
      </View>
    </SlideUpModal>
  );
});

export default CommentModal;

function CommentReplies({ commentId }) {
  const replies = getCommentReplies(commentId);
  if (!replies.length) return null;

  return (
    <View style={styles.repliesContainer}>
      {replies.map((reply) => {
        const profile = getProfileById(reply.userId);
        const isVerified = profile?.verified || reply.verified;
        const verifiedVariant = profile?.verifiedVariant || reply.verifiedVariant || "blue";

        return (
          <View key={reply.id} style={styles.replyContainer}>
            <Avatar uri={reply.avatar || profile?.avatar} name={reply.user} size={28} />
            <View style={styles.replyContent}>
              <View style={styles.replyHeader}>
                <Text style={styles.replyUser}>{reply.user}</Text>
                {isVerified && <VerifiedBadge variant={verifiedVariant} size={12} inline />}
                <Text style={styles.replyTime}>{reply.time}</Text>
              </View>
              <Text style={styles.replyText}>{reply.text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  commentAvatar: {
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.ink,
  },
  commentHandle: {
    fontSize: 13,
    color: palette.muted,
    marginLeft: 6,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 21,
    color: palette.ink,
    marginBottom: 6,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  commentTime: {
    fontSize: 12,
    color: palette.muted,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: palette.muted,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 12,
    gap: 12,
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  replyUser: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.ink,
  },
  replyTime: {
    fontSize: 11,
    color: palette.muted,
    marginLeft: 6,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: palette.ink,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
