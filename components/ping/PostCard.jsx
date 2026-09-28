import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import Card from "../ui/Card";
import VerifiedBadge from "../ui/VerifiedBadge";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { formatLikes } from "../../lib/mockData";

const LIKE_PINK = "#F0407F";
const RING_PINK = "#F2A7C6";
const SEE_MORE_LIMIT = 90;

export function PostHeader({ post, onFollow, onMore, onProfilePress }) {
  const { user, avatar, verified, verifiedVariant, time, tagged, showFollow } = post;

  const handleProfilePress = () => {
    onProfilePress && onProfilePress(post);
  };

  return (
    <View style={styles.cardHeader}>
      <Pressable
        onPress={handleProfilePress}
        style={styles.avatarWrap}
        accessibilityRole="button"
        accessibilityLabel={`View ${user}'s profile`}
      >
        <Avatar uri={avatar} name={user} size={44} />
      </Pressable>

      <Pressable
        onPress={handleProfilePress}
        style={styles.meta}
        accessibilityRole="button"
        accessibilityLabel={`View ${user}'s profile`}
      >
        <View style={styles.userRow}>
          <Text style={styles.user} numberOfLines={1}>
            {user}
          </Text>
          {verified && (
            <VerifiedBadge variant={verifiedVariant || "blue"} size={18} inline />
          )}
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{time}</Text>
          <View style={styles.timeDivider} />
          <Icon name="globe" size={13} color={palette.muted} />
        </View>
      </Pressable>

      {tagged.length > 0 && (
        <View style={styles.taggedRow}>
          {tagged.map((uri, i) => (
            <View
              key={uri}
              style={[styles.taggedRing, i > 0 && styles.taggedOverlap]}
            >
              <Image source={{ uri }} style={styles.taggedImg} />
            </View>
          ))}
        </View>
      )}

      {showFollow && (
        <Pressable
          onPress={onFollow}
          style={styles.followBtn}
          accessibilityRole="button"
          accessibilityLabel={`Follow ${user}`}
        >
          <Text style={styles.followText}>Follow</Text>
        </Pressable>
      )}

      <Pressable
        onPress={onMore}
        style={styles.moreBtn}
        accessibilityRole="button"
        accessibilityLabel="More options"
      >
        <Icon name="more" size={22} color={palette.ink} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}

export function PostBody({ post }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.text.length > SEE_MORE_LIMIT;
  const body =
    !isLong || expanded
      ? post.text
      : `${post.text.slice(0, SEE_MORE_LIMIT).trimEnd()}...`;

  return (
    <>
      <Text style={styles.pingText}>
        {body}
        {isLong && !expanded && (
          <Text style={styles.seeMore} onPress={() => setExpanded(true)}>
            {" "}
            see more
          </Text>
        )}
      </Text>

      {post.tags.length > 0 && (
        <Text style={styles.tags}>{post.tags.map((t) => `#${t}`).join(" ")}</Text>
      )}
    </>
  );
}

export function PostMedia({ media, aspectRatio = 1 }) {
  if (!media) return null;

  return (
    <View style={[styles.mediaWrap, { aspectRatio }]}>
      <Image
        source={{ uri: media.uri }}
        style={styles.media}
        resizeMode="cover"
      />
      {media.type === "video" && (
        <View style={styles.videoPill}>
          <Icon name="volume" size={16} color="#FFFFFF" />
          <Text style={styles.videoPillText}>{media.duration}</Text>
        </View>
      )}
    </View>
  );
}

export function PostActions({ post, liked, saved, onLike, onComment, onShare, onSave }) {
  const likeCount =
    post.likes + (liked && !post.liked ? 1 : 0) - (!liked && post.liked ? 1 : 0);

  return (
    <View style={styles.footer}>
      <View style={styles.footerLeft}>
        <Pressable
          onPress={onLike}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={`Like ${post.user}`}
        >
          <Icon
            name="heart"
            size={22}
            color={liked ? LIKE_PINK : palette.muted}
          />
          <Text style={styles.actionText}>
            <Text style={styles.actionCount}>{formatLikes(likeCount)}</Text> Likes
          </Text>
        </Pressable>

        <Pressable
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={`Comment on ${post.user}`}
          onPress={onComment}
        >
          <Icon name="comment" size={22} color={palette.ink} />
          <Text style={styles.actionText}>
            <Text style={styles.actionCount}>{post.replies}</Text> Comments
          </Text>
        </Pressable>
      </View>

      <View style={styles.footerRight}>
        <Pressable
          style={styles.iconAction}
          accessibilityRole="button"
          accessibilityLabel={`Share ${post.user}`}
          onPress={onShare}
        >
          <Icon name="share" size={22} color={palette.ink} />
        </Pressable>

        <Pressable
          onPress={onSave}
          style={styles.iconAction}
          accessibilityRole="button"
          accessibilityLabel="Bookmark"
        >
          <Icon
            name="bookmark"
            size={22}
            color={saved ? palette.primary : palette.muted}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function PostCard({
  post,
  onFollow,
  onMore,
  onProfilePress,
  onLike,
  onComment,
  onShare,
  onSave,
}) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(false);

  return (
    <Card style={styles.card} padding={14} elevated>
      <PostHeader
        post={post}
        onFollow={onFollow}
        onMore={onMore}
        onProfilePress={onProfilePress}
      />
      <PostBody post={post} />
      <PostMedia media={post.media} />
      <PostActions
        post={post}
        liked={liked}
        saved={saved}
        onLike={() => setLiked((l) => !l)}
        onSave={() => setSaved((s) => !s)}
        onComment={onComment}
        onShare={onShare}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrap: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
   meta: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  user: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.ink,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: palette.muted,
  },
  timeDivider: {
    width: StyleSheet.hairlineWidth,
    height: 12,
    backgroundColor: palette.muted,
    marginHorizontal: 8,
  },

  taggedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },
  taggedRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: RING_PINK,
    padding: 2,
    backgroundColor: palette.card,
  },
  taggedOverlap: { marginLeft: -8 },
  taggedImg: { width: "100%", height: "100%", borderRadius: 14 },

  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    marginRight: 2,
  },
  followBtnActive: { backgroundColor: palette.ink, borderColor: palette.ink },
  followText: { fontSize: 13, fontWeight: "500", color: palette.ink },
  followTextActive: { color: palette.card },

  moreBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  pingText: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.ink,
    marginBottom: 8,
  },
  seeMore: { color: palette.muted },
  tags: {
    fontSize: 14,
    lineHeight: 20,
    color: "#2F80ED",
    marginBottom: 12,
  },

  mediaWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: 12,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  videoPill: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  videoPillText: { fontSize: 13, fontWeight: "500", color: "#FFFFFF" },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconAction: { padding: 0 },
  actionText: { fontSize: 14, color: palette.muted },
  actionCount: { color: palette.ink, fontWeight: "500" },
});
