import React, { useCallback, useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import Icon from "../../components/ui/Icon";
import { palette } from "../../constants/colors";
import PostCard from "../../components/ping/PostCard";
import StoriesRow from "../../components/stories/StoriesRow";
import CommentModal from "../../components/ping/CommentModal";
import LikeModal from "../../components/ping/LikeModal";
import { useFeed } from "../../hooks/useFeed";
import { useStoriesData } from "../../hooks/useStoriesData";
import { useSocialData } from "../../hooks/useSocialData";

function HomeHeader({ onDiscover, onNotifications, unreadCount = 0 }) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>Ping</Text>
      <View style={styles.headerIcons}>
        <Pressable
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Discover"
          onPress={onDiscover}
        >
          <Icon name="discover" size={24} color={palette.ink} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={onNotifications}
        >
          <Icon name="notifications" size={22} color={palette.ink} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { pings, loadingMore, refreshing, onEndReached, onRefresh } = useFeed();
  const { stories, myProfile, onOpenStory } = useStoriesData();
  const { notifications } = useSocialData();
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const commentModalRef = useRef(null);
  const likeModalRef = useRef(null);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [activeLikeId, setActiveLikeId] = useState(null);

  const handleProfilePress = useCallback(
    (post) => {
      if (post.userId) {
        router.push(`/profile/${encodeURIComponent(post.userId)}`);
      }
    },
    [router]
  );

  const handleComment = useCallback((post) => {
    setActiveCommentId(post.id);
    setTimeout(() => {
      commentModalRef.current?.open();
    }, 50);
  }, []);

  const handleLike = useCallback((post) => {
    setActiveLikeId(post.id);
    setTimeout(() => {
      likeModalRef.current?.open();
    }, 50);
  }, []);

  // Story creation lives in the Create tab, so the story row hands off to it.
  const handleStartStory = useCallback(
    () => router.navigate({ pathname: "/create", params: { mode: "story" } }),
    [router]
  );

  return (
    <PhoneScreen padded={false}>
      <HomeHeader
        unreadCount={unreadCount}
        onDiscover={() => router.push("/discover")}
        onNotifications={() => router.push("/notifications")}
      />

      <ScrollView
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
          const isCloseToBottom =
            contentSize.height - (layoutMeasurement.height + contentOffset.y) < 100;

          if (isCloseToBottom && !loadingMore) {
            onEndReached();
          }
        }}
        scrollEventThrottle={32}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <StoriesRow
          myAvatar={myProfile?.avatar}
          stories={stories}
          onStartStory={handleStartStory}
          onOpenStory={onOpenStory}
        />
        {pings.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            onProfilePress={handleProfilePress}
            onComment={() => handleComment(p)}
            onLike={() => handleLike(p)}
          />
        ))}
      </ScrollView>

      <CommentModal
        ref={commentModalRef}
        postId={activeCommentId}
        onClose={() => setActiveCommentId(null)}
      />

      <LikeModal
        ref={likeModalRef}
        postId={activeLikeId}
        onClose={() => setActiveLikeId(null)}
      />
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    backgroundColor: palette.card,
  },
  logo: { fontSize: 24, fontWeight: "800", color: palette.ink },
  headerIcons: { flexDirection: "row" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: palette.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF" },

  feed: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 14,
  },
});
