import React, { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import Icon from "../../components/ui/Icon";
import { palette } from "../../constants/colors";
import PostCard from "../../components/ping/PostCard";
import StoriesRow from "../../components/stories/StoriesRow";
import { useFeed } from "../../hooks/useFeed";
import { useStoriesData } from "../../hooks/useStoriesData";

function HomeHeader({ onSearch, onNotifications }) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>Ping</Text>
      <View style={styles.headerIcons}>
        <Pressable
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Search"
          onPress={onSearch}
        >
          <Icon name="search" size={22} color={palette.ink} />
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

  const handleProfilePress = useCallback(
    (post) => {
      if (post.userId) {
        router.push(`/profile/${encodeURIComponent(post.userId)}`);
      }
    },
    [router]
  );

  return (
    <PhoneScreen padded={false}>
      <HomeHeader />

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
          />
        ))}
      </ScrollView>
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
  headerIcons: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
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
