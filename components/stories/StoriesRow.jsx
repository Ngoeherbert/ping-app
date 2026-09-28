import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import Avatar from "../ui/Avatar";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { shadows } from "../../constants/shadows";

const TAG_BLUE = "#2F80ED";
const LIKE_PINK = "#F0407F";

export function StoryTile({ story, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.storyTile, { borderColor: story.seen ? "#D5D8DD" : LIKE_PINK, borderWidth: 0 }]}
      accessibilityRole="button"
      accessibilityLabel="Open story"
    >
      <Image source={{ uri: story.cover }} style={styles.storyCover} resizeMode="cover" />
      <View style={[styles.storyRing, story.seen && styles.storyRingSeen]}>
        <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
      </View>
    </Pressable>
  );
}

export function CreateStoryCard({ avatar, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.startCard, shadows.card]}
      accessibilityRole="button"
      accessibilityLabel="Start a story"
    >
      <View>
        <Avatar uri={avatar} name="You" size={74} />
        <View style={styles.plusBadge}>
          <View style={styles.plusBarH} />
          <View style={styles.plusBarV} />
        </View>
      </View>
      <Text style={styles.startText}>Start a story</Text>
    </Pressable>
  );
}

export default function StoriesRow({ myAvatar, stories, onStartStory, onOpenStory }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesScroll}
      contentContainerStyle={styles.stories}
    >
      <CreateStoryCard avatar={myAvatar} onPress={onStartStory} />
      {stories.map((s) => (
        <StoryTile
          key={s.id}
          story={s}
          onPress={() => onOpenStory && onOpenStory(s)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  storiesScroll: { marginHorizontal: -12, flexGrow: 0 },
  stories: { paddingHorizontal: 12, gap: 12 },

  startCard: {
    width: 128,
    height: 176,
    borderRadius: radius.sm,
    backgroundColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  startText: { fontSize: 14, color: palette.muted, textAlign: "center" },
  plusBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TAG_BLUE,
    borderWidth: 2,
    borderColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  plusBarH: {
    position: "absolute",
    width: 14,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },
  plusBarV: {
    position: "absolute",
    width: 2.5,
    height: 14,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },

  storyTile: {
    width: 128,
    height: 176,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: palette.line,
  },
  storyCover: { ...StyleSheet.absoluteFillObject },
  storyRing: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: LIKE_PINK,
    padding: 2,
    backgroundColor: palette.card,
  },
  storyRingSeen: { borderColor: "#D5D8DD" },
  storyAvatar: { width: "100%", height: "100%", borderRadius: 21 },
});
