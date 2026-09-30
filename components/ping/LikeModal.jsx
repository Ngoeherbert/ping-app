import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import SlideUpModal from "../ui/SlideUpModal";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import VerifiedBadge from "../ui/VerifiedBadge";
import { palette } from "../../constants/colors";
import { getLikes, getProfileById } from "../../lib/mockData";

const LikeModal = forwardRef(function LikeModal(
  { postId, onClose },
  ref
) {
  const likes = postId ? getLikes(postId) : [];

  return (
    <SlideUpModal
      ref={ref}
      title="Likes"
      onClose={onClose}
      snapPoints={["50%", "75%"]}
      showCloseButton
    >
      {likes.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="heart" size={48} color={palette.muted} />
          <Text style={styles.emptyText}>No likes yet</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {likes.map((like) => {
            const profile = like.userId ? getProfileById(like.userId) : null;
            const name = like.user || profile?.name || "Unknown";
            const avatar = like.avatar || profile?.avatar || undefined;
            const handle = like.handle || profile?.handle || `@${name.toLowerCase().replace(/ /g, "")}`;
            const verified = like.verified || profile?.verified || false;
            const verifiedVariant = profile?.verifiedVariant || like.verifiedVariant || "blue";
            const reaction = like.reaction || "❤️";

            return (
              <View key={like.id} style={styles.likeItem}>
                <Avatar uri={avatar} name={name} size={44} />
                <View style={styles.likeInfo}>
                  <View style={styles.likeNameRow}>
                    <Text style={styles.likeUser} numberOfLines={1}>
                      {name}
                    </Text>
                    {verified && <VerifiedBadge variant={verifiedVariant} size={14} inline />}
                  </View>
                  <Text style={styles.likeHandle}>{handle}</Text>
                </View>
                <Text style={styles.likeReaction}>{reaction}</Text>
                <Text style={styles.likeTime}>{like.time}</Text>
              </View>
            );
          })}
        </View>
      )}
    </SlideUpModal>
  );
});

export default LikeModal;

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: palette.muted,
  },
  list: {
    gap: 4,
  },
  likeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  likeInfo: {
    flex: 1,
    minWidth: 0,
  },
  likeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeUser: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.ink,
  },
  likeHandle: {
    fontSize: 13,
    color: palette.muted,
  },
  likeReaction: {
    fontSize: 20,
    marginRight: 8,
  },
  likeTime: {
    fontSize: 12,
    color: palette.muted,
  },
});
