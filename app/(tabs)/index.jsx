import React, { useCallback, useState, useRef } from "react";
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

function HomeHeader({ onDiscover, onCreateSquare, onNotifications }) {
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
          accessibilityLabel="Square Plus"
          onPress={onCreateSquare}
        >
          <Icon name="squarePlus" size={24} color={palette.ink} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={onNotifications}
        >
          <Icon name="notifications" size={22} color={palette.ink} />
          <View style={styles.badge} />
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { pings, loadingMore, refreshing, onEndReached, onRefresh } = useFeed();
  const { stories, myProfile, onOpenStory, onStartStory } = useStoriesData();

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

  return (
    <PhoneScreen padded={false}>
      <HomeHeader
        onDiscover={() => router.push("/discover")}
        onCreateSquare={() => {}}
        onNotifications={() => {}}
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
          onStartStory={onStartStory}
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
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.danger,
  },

  feed: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 14,
  },
});
