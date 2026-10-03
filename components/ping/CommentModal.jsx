import React, { useState, useCallback, forwardRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";
import Sheet from "../ui/CustomModalSheet";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import FilledIcon from "../../constants/FilledIcon";
import VerifiedBadge from "../ui/VerifiedBadge";
import { palette } from "../../constants/colors";
import { MY_AVATAR, getProfileById } from "../../lib/mockData";
import { useComments, useReplies, getCommentState } from "../../lib/stores/commentStore";

const LIKE_PINK = "#F0407F";
const ME = { user: "You", handle: "@you", avatar: MY_AVATAR };

const CommentModal = forwardRef(function CommentModal({ postId, onClose }, ref) {
  const [draft, setDraft] = useState("");
  // Which comment the composer is replying to; null means a top-level comment.
  const [replyTo, setReplyTo] = useState(null);
  const comments = useComments(postId);
  const { addComment, addReply, toggleLike } = getCommentState();

  const handleSubmit = useCallback(() => {
    const text = draft.trim();
    if (!text || !postId) return;
    if (replyTo) addReply(replyTo.id, { ...ME, text });
    else addComment(postId, { ...ME, text });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setDraft("");
    setReplyTo(null);
  }, [draft, postId, replyTo, addComment, addReply]);

  const handleLike = useCallback(
    (id) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      toggleLike(id);
    },
    [toggleLike]
  );

  const startReply = useCallback((comment) => {
    Haptics.selectionAsync().catch(() => {});
    setReplyTo(comment);
  }, []);

  return (
    <Sheet
      ref={ref}
      title={`Comments${comments.length ? ` · ${comments.length}` : ""}`}
      onClose={onClose}
      showCloseButton
      footer={
        <View style={styles.inputRow}>
          <Avatar uri={ME.avatar} name={ME.user} size={32} />
          <View style={styles.inputContainer}>
            {replyTo ? (
              <View style={styles.replyingBar}>
                <Text style={styles.replyingText} numberOfLines={1}>
                  Replying to {replyTo.user}
                </Text>
                <Pressable
                  onPress={() => setReplyTo(null)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel reply"
                >
                  <Icon name="close" size={14} color={palette.muted} />
                </Pressable>
              </View>
            ) : null}
            <TextInput
              style={styles.commentInput}
              placeholder={replyTo ? "Add a reply..." : "Add a comment..."}
              placeholderTextColor={palette.muted}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={handleSubmit}
              returnKeyType="send"
              blurOnSubmit={false}
              multiline
            />
          </View>
          <Pressable
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={handleSubmit}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel={replyTo ? "Send reply" : "Send comment"}
          >
            <Icon name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      }
    >
      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          comments.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      {comments.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.empty}>
            <Icon name="comment" size={44} color={palette.muted} />
            <Text style={styles.emptyText}>No comments yet. Be the first to comment.</Text>
          </View>
        </View>
      ) : (
        comments.map((comment) => {
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
                  onPress={() => handleLike(comment.id)}
                  accessibilityRole="button"
                  accessibilityLabel={comment.liked ? "Unlike comment" : "Like comment"}
                >
                  {comment.liked ? (
                    <FilledIcon name="heart" size={16} color={LIKE_PINK} />
                  ) : (
                    <Icon name="heart" size={16} color={palette.muted} />
                  )}
                  <Text style={[styles.commentActionText, comment.liked && styles.commentActionOn]}>
                    {comment.likes}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.commentAction}
                  onPress={() => startReply(comment)}
                  accessibilityRole="button"
                  accessibilityLabel={`Reply to ${comment.user}`}
                >
                  <Text style={styles.commentActionText}>Reply</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
          })
        )}
      </ScrollView>
    </Sheet>
  );
});

export default CommentModal;

function CommentReplies({ commentId }) {
  const replies = useReplies(commentId);
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
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    maxWidth: 260,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 21,
    color: palette.muted,
    textAlign: "center",
  },
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
  commentActionOn: {
    color: LIKE_PINK,
    fontWeight: "700",
  },
  replyingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 7,
  },
  replyingText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: palette.card,
  },
  inputContainer: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    paddingHorizontal: 13,
    borderRadius: 21,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: palette.ink,
    paddingVertical: 14,
    minHeight: 42,
    maxHeight: 110,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
