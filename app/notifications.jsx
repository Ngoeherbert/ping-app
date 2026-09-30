import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import Avatar from "../components/ui/Avatar";
import Icon from "../components/ui/Icon";
import { palette } from "../constants/colors";
import { useSocialData } from "../hooks/useSocialData";
import { getPostById, getReelById, getStories } from "../lib/mockData";

const UNREAD_BG = palette.primarySoft;

// Each notification type gets a coloured glyph badge on the avatar, the same
// way Facebook marks likes / comments / follows.
const TYPE_META = {
  like: { icon: "heart", color: "#F0407F" },
  comment: { icon: "comment", color: "#2F80ED" },
  reply: { icon: "reply", color: "#2F80ED" },
  mention: { icon: "sparkle", color: "#7C3AED" },
  follow: { icon: "follow", color: "#16A34A" },
  story: { icon: "star", color: "#F5A524" },
  reel: { icon: "reels", color: "#7C3AED" },
  group_invite: { icon: "users", color: "#5B57FF" },
  community_invite: { icon: "users", color: "#5B57FF" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread", unreadOnly: true },
  { key: "likes", label: "Likes", types: ["like"] },
  { key: "comments", label: "Comments", types: ["comment", "reply"] },
  { key: "follows", label: "Follows", types: ["follow"] },
  { key: "mentions", label: "Mentions", types: ["mention"] },
  { key: "groups", label: "Groups", types: ["group_invite", "community_invite"] },
];

/** Small preview tile Facebook shows on the right of media notifications. */
function previewUri(notification) {
  if (notification.type === "reel" && notification.reelId) {
    return getReelById(notification.reelId)?.cover ?? null;
  }
  if (notification.type === "story" && notification.storyId) {
    const story = getStories().find((s) => s.id === notification.storyId);
    return story?.cover ?? null;
  }
  if (notification.postId) {
    return (
      getPostById(notification.postId)?.media?.uri ??
      `https://picsum.photos/seed/ping-post-${notification.postId}/120/120`
    );
  }
  return null;
}

function NotificationRow({ notification, onPress }) {
  const meta = TYPE_META[notification.type] ?? TYPE_META.like;
  const preview = previewUri(notification);

  return (
    <Pressable
      onPress={() => onPress(notification)}
      style={({ pressed }) => [
        styles.row,
        !notification.read && styles.rowUnread,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notification.user} ${notification.text}`}
    >
      <View style={styles.avatarWrap}>
        <Avatar uri={notification.avatar} name={notification.user} size={54} />
        <View style={[styles.typeBadge, { backgroundColor: meta.color }]}>
          <Icon name={meta.icon} size={12} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.rowText} numberOfLines={3}>
          <Text style={styles.rowName}>{notification.user}</Text>{" "}
          {notification.text}
        </Text>
        <Text style={styles.rowTime}>{notification.time}</Text>
      </View>

      {preview ? (
        <Image source={{ uri: preview }} style={styles.preview} resizeMode="cover" />
      ) : null}

      {!notification.read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markAllNotificationsRead, markNotificationRead } =
    useSocialData();

  const [activeFilter, setActiveFilter] = useState("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter) ?? FILTERS[0];
    if (filter.unreadOnly) return notifications.filter((n) => !n.read);
    if (filter.types) {
      return notifications.filter((n) => filter.types.includes(n.type));
    }
    return notifications;
  }, [activeFilter, notifications]);

  const fresh = useMemo(() => filtered.filter((n) => !n.read), [filtered]);
  const earlier = useMemo(() => filtered.filter((n) => n.read), [filtered]);

  const openTarget = useCallback(
    (notification) => {
      markNotificationRead(notification.id);

      if (notification.type === "follow" && notification.userId) {
        router.push(`/profile/${encodeURIComponent(notification.userId)}`);
        return;
      }
      if (notification.type === "reel") {
        router.push("/reels");
        return;
      }
      if (
        notification.type === "group_invite" ||
        notification.type === "community_invite"
      ) {
        router.push("/gists");
        return;
      }
      if (notification.postId || notification.storyId) {
        router.push("/");
        return;
      }
      if (notification.userId) {
        router.push(`/profile/${encodeURIComponent(notification.userId)}`);
      }
    },
    [markNotificationRead, router]
  );

  const handleMarkAll = useCallback(() => {
    if (!unreadCount) return;
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    ).catch(() => {});
    markAllNotificationsRead();
  }, [markAllNotificationsRead, unreadCount]);

  const renderSection = (title, items) => {
    if (!items.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onPress={openTarget}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Icon name="back" size={24} color={palette.ink} strokeWidth={1.7} />
        </Pressable>

        <Text style={styles.title}>Notifications</Text>

        <Pressable
          style={[styles.iconBtn, !!unreadCount && styles.iconBtnActive]}
          onPress={handleMarkAll}
          disabled={!unreadCount}
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
          accessibilityState={{ disabled: !unreadCount }}
        >
          <Icon
            name="check"
            size={20}
            color={unreadCount ? palette.primary : palette.muted}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((filter) => {
            const active = filter.key === activeFilter;
            return (
              <Pressable
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={filter.label}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {filter.label}
                </Text>
                {filter.key === "unread" && unreadCount > 0 && (
                  <View style={styles.chipBadge}>
                    <Text style={styles.chipBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="notifications" size={44} color={palette.muted} />
            <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
            <Text style={styles.emptyText}>
              New likes, comments and follows will land here.
            </Text>
          </View>
        ) : (
          <>
            {renderSection("New", fresh)}
            {renderSection("Earlier", earlier)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  title: { fontSize: 20, fontWeight: "800", color: palette.ink },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: { backgroundColor: palette.primarySoft },

  filters: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: palette.surface,
  },
  chipActive: { backgroundColor: palette.ink },
  chipText: { fontSize: 13, fontWeight: "600", color: palette.ink },
  chipTextActive: { color: palette.card },
  chipBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: palette.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  chipBadgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },

  list: { paddingBottom: 32 },

  section: { paddingTop: 6 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  rowUnread: { backgroundColor: UNREAD_BG },
  rowPressed: { opacity: 0.7 },
  avatarWrap: { width: 54, height: 54 },
  typeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: palette.background,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowText: { fontSize: 14.5, lineHeight: 20, color: palette.ink },
  rowName: { fontWeight: "700" },
  rowTime: { fontSize: 12, color: palette.muted, marginTop: 3 },

  preview: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: palette.surface,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: palette.ink },
  emptyText: {
    fontSize: 14,
    color: palette.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
