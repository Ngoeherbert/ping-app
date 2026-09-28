import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import Icon from "../../components/ui/Icon";
import { palette } from "../../constants/colors";
import PostCard from "../../components/ping/PostCard";
import StoriesRow from "../../components/stories/StoriesRow";

const MY_AVATAR = "https://picsum.photos/seed/me/120/120";

const STORIES = [
  {
    id: "s1",
    avatar: "https://picsum.photos/seed/story-av-1/80/80",
    cover: "https://picsum.photos/seed/story-1/240/320",
    seen: false,
  },
  {
    id: "s2",
    avatar: "https://picsum.photos/seed/story-av-2/80/80",
    cover: "https://picsum.photos/seed/story-2/240/320",
    seen: false,
  },
  {
    id: "s3",
    avatar: "https://picsum.photos/seed/story-av-3/80/80",
    cover: "https://picsum.photos/seed/story-3/240/320",
    seen: true,
  },
  {
    id: "s4",
    avatar: "https://picsum.photos/seed/story-av-4/80/80",
    cover: "https://picsum.photos/seed/story-4/240/320",
    seen: true,
  },
  {
    id: "s5",
    avatar: "https://picsum.photos/seed/story-av-5/80/80",
    cover: "https://picsum.photos/seed/story-5/240/320",
    seen: false,
  },
];

const PINGS = [
  {
    id: "1",
    user: "Adaeze O.",
    handle: "@adaeze",
    avatar: "https://picsum.photos/seed/adaeze/120/120",
    time: "2m ago",
    text: "Who's at the beach house this weekend? Bringing snacks, a speaker and far too many board games for one evening.",
    tags: ["weekend", "beachhouse"],
    likes: 24,
    replies: 8,
    liked: false,
    verified: false,
    showFollow: true,
    tagged: [],
    media: null,
  },
  {
    id: "2",
    user: "Kwame M.",
    handle: "@kwame",
    avatar: "https://picsum.photos/seed/kwame/120/120",
    time: "18m ago",
    text: "Just dropped a new reel - behind the scenes from Lagos.",
    tags: ["travel", "lagos", "reel"],
    likes: 112,
    replies: 31,
    liked: true,
    verified: true,
    showFollow: false,
    tagged: [
      "https://picsum.photos/seed/tag-a/80/80",
      "https://picsum.photos/seed/tag-b/80/80",
    ],
    media: {
      type: "video",
      uri: "https://picsum.photos/seed/ping-reel/600/520",
      duration: "0:32",
    },
  },
  {
    id: "3",
    user: "Ping Team",
    handle: "@ping",
    avatar: "https://picsum.photos/seed/pingteam/120/120",
    time: "1h ago",
    text: "Welcome to Ping. Say hi with your first ping.",
    tags: ["welcome", "ping"],
    likes: 300,
    replies: 95,
    liked: false,
    verified: true,
    showFollow: true,
    tagged: [],
    media: {
      type: "image",
      uri: "https://picsum.photos/seed/ping-welcome/600/600",
    },
  },
];

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
  return (
    <PhoneScreen padded={false}>
      <HomeHeader />

      <ScrollView
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      >
        <StoriesRow
          myAvatar={MY_AVATAR}
          stories={STORIES}
          onStartStory={() => {}}
          onOpenStory={(s) => {}}
        />
        {PINGS.map((p) => (
          <PostCard key={p.id} post={p} />
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
