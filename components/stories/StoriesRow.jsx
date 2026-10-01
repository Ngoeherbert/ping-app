import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { shadows } from "../../constants/shadows";
import { USER_PROFILES, MY_USER_ID, MY_PROFILE } from "../../lib/mockData";
import { storyKind } from "../../lib/stores/storyStore";

const TAG_BLUE = "#2F80ED";
const LIKE_PINK = "#F0407F";

export function StoryTile({ story, onPress }) {
  const kind = storyKind(story);
  const [imgErr, setImgErr] = useState(false);
  const remote = typeof story.cover === "string" && /^https?:\/\//i.test(story.cover);
  // Only image stories (plus stories with a real remote thumbnail) show a photo;
  // every other kind gets a type-styled fallback instead of a blank tile.
  const cover =
    !imgErr && (kind === "image" || (kind === "video" && remote))
      ? story.cover
      : null;
  const icon = kind === "video" ? "play" : kind === "link" ? "link" : kind === "audio" ? "mic" : "image";
  return (
    <Pressable
      onPress={onPress}
      style={[styles.storyTile, { borderColor: story.seen ? "#D5D8DD" : LIKE_PINK, borderWidth: 0 }]}
      accessibilityRole="button"
      accessibilityLabel="Open story"
    >
      {cover ? (
        <Image
          source={{ uri: cover }}
          style={styles.storyCover}
          resizeMode="cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <View
          style={[
            styles.storyCover,
            styles.coverFallback,
            kind === "text" && { backgroundColor: story.bg ?? "#111B21" },
          ]}
        >
          {kind === "text" ? (
            <Text style={[styles.coverGlyph, { color: story.textColor ?? "#FFFFFF" }]}>Aa</Text>
          ) : (
            <Icon name={icon} size={30} color="#00A884" />
          )}
        </View>
      )}
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

/**
 * Groups the flat story list into one entry per user:
 *   { userId, username, avatar, stories: [...] }
 * The viewer receives only the selected group's stories.
 */
export function groupStoriesByUser(stories) {
  const groups = [];
  const byUser = new Map();
  for (const s of stories ?? []) {
    if (!s) continue;
    const key = String(s.userId ?? "unknown");
    let g = byUser.get(key);
    if (!g) {
      g = { userId: key, username: null, avatar: null, stories: [] };
      byUser.set(key, g);
      groups.push(g);
    }
    g.stories.push(s);
    if (!g.avatar && s.avatar) g.avatar = s.avatar;
  }
  for (const g of groups) {
    const first = g.stories[0];
    const profile =
      first.userId === MY_USER_ID || first.mine
        ? MY_PROFILE
        : USER_PROFILES[String(first.userId)];
    g.username = first.name ?? profile?.name ?? "Unknown";
  }
  return groups;
}

export default function StoriesRow({ myAvatar, stories, onStartStory, onOpenStory, onOpenMyStory }) {
  const groups = useMemo(() => groupStoriesByUser(stories), [stories]);
  const myStories = useMemo(() => stories.filter((s) => s.userId === MY_USER_ID), [stories]);
  const hasMyStories = myStories.length > 0;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesScroll}
      contentContainerStyle={styles.stories}
    >
      {!hasMyStories ? (
        <CreateStoryCard avatar={myAvatar} onPress={onStartStory} />
      ) : null}
      {groups.map((g) => {
        const isMine = g.stories.every((s) => s.userId === MY_USER_ID) && g.stories.length > 0;
        // Start this user's session on their first unseen story (or latest).
        const primary = g.stories.find((x) => !x.seen) ?? g.stories[0];
        const allSeen = g.stories.every((x) => x.seen);
        return (
          <StoryTile
            key={g.userId}
            story={{ ...primary, seen: allSeen }}
            onPress={() => {
              if (isMine && onOpenMyStory) onOpenMyStory();
              else if (onOpenStory && !isMine) onOpenStory(primary);
            }}
          />
        );
      })}
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
  coverFallback: { backgroundColor: "#111B21", alignItems: "center", justifyContent: "center" },
  coverGlyph: { fontSize: 34, fontWeight: "800" },
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
