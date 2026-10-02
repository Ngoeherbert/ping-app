import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { shadows } from "../../constants/shadows";
import { USER_PROFILES, MY_USER_ID, MY_PROFILE } from "../../lib/mockData";
import { storyKind } from "../../lib/stores/storyStore";
import { TEXT_FONTS, fmtDur, linkDomain } from "./create/constants";

const TAG_BLUE = "#2F80ED";
const LIKE_PINK = "#F0407F";

/**
 * Content preview for stories that have no photo: real text, a link card, or
 * voice-note details — so an uploaded story reads as itself in the row instead
 * of collapsing to a generic type icon.
 */
function StoryKindPreview({ story }) {
  const kind = storyKind(story);

  if (kind === "text") {
    const body = String(story.text ?? story.caption ?? "").trim();
    const weight = TEXT_FONTS.find((f) => f.key === story.font)?.weight ?? "700";
    return (
      <View style={[styles.storyCover, styles.coverFallback, { backgroundColor: story.bg ?? "#111B21" }]}>
        {body ? (
          <Text
            style={[styles.previewText, { color: story.textColor ?? "#FFFFFF", fontWeight: weight }]}
            numberOfLines={4}
          >
            {body}
          </Text>
        ) : (
          <Icon name="edit" size={30} color="#00A884" />
        )}
      </View>
    );
  }

  if (kind === "link") {
    const url = story.url ?? story.link ?? null;
    const valid = /^https?:\/\/\S+$/i.test(String(url ?? ""));
    const domain = valid ? linkDomain(url) : "Link unavailable";
    return (
      <View style={[styles.storyCover, styles.coverFallback]}>
        {story.thumbnail ? (
          <Image source={{ uri: story.thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <View style={[styles.previewOverlay, !!story.thumbnail && styles.previewOverlayDim]}>
          <View style={styles.previewIcon}>
            <Icon name="link" size={18} color="#00A884" />
          </View>
          <Text style={styles.previewTitle} numberOfLines={2}>
            {story.title ?? domain}
          </Text>
          <Text style={styles.previewMeta} numberOfLines={1}>
            {domain}
          </Text>
        </View>
      </View>
    );
  }

  if (kind === "audio") {
    return (
      <View style={[styles.storyCover, styles.coverFallback]}>
        <View style={styles.previewOverlay}>
          <View style={[styles.previewIcon, styles.previewIconLg]}>
            <Icon name="mic" size={24} color="#00A884" />
          </View>
          <Text style={styles.previewTitle} numberOfLines={2}>
            {story.title ?? "Voice note"}
          </Text>
          <Text style={styles.previewMeta}>
            {story.duration ? fmtDur(story.duration) : "Voice"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.storyCover, styles.coverFallback]}>
      <Icon name="image" size={30} color="#00A884" />
    </View>
  );
}

export function StoryTile({ story, name, onPress }) {
  const kind = storyKind(story);
  const [imgErr, setImgErr] = useState(false);
  const remote = typeof story.cover === "string" && /^https?:\/\//i.test(story.cover);
  // Only image stories (plus stories with a real remote thumbnail) show a photo;
  // every other kind renders its own content preview instead.
  const cover =
    !imgErr && (kind === "image" || (kind === "video" && remote))
      ? story.cover
      : null;
  // `name` comes from the owning user's group so the tile can label itself even
  // for seeded stories that carry no `name` of their own.
  const label = name ?? story.name ?? "Story";
  return (
    <Pressable
      onPress={onPress}
      style={[styles.storyTile, { borderColor: story.seen ? "#D5D8DD" : LIKE_PINK, borderWidth: 0 }]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${label}'s story`}
    >
      {cover ? (
        <Image
          source={{ uri: cover }}
          style={styles.storyCover}
          resizeMode="cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <StoryKindPreview story={story} />
      )}
      {/* Scrim keeps the white name readable over any cover image. */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.8)"]}
        style={styles.storyScrim}
        pointerEvents="none"
      />
      <View style={styles.storyFooter}>
        <View style={[styles.storyRing, story.seen && styles.storyRingSeen]}>
          <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
        </View>
        <Text style={styles.storyName} numberOfLines={1}>
          {label}
        </Text>
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
            name={g.username}
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
  // paddingBottom keeps the preview clear of the avatar/name footer below it.
  coverFallback: { backgroundColor: "#111B21", alignItems: "center", justifyContent: "center", paddingBottom: 46, paddingHorizontal: 8 },
  previewText: { textAlign: "center", fontSize: 15, lineHeight: 20 },
  previewOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 10, paddingBottom: 46 },
  previewOverlayDim: { backgroundColor: "rgba(12,20,26,0.82)" },
  previewIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,168,132,0.16)" },
  previewIconLg: { width: 44, height: 44, borderRadius: 22 },
  previewTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", textAlign: "center" },
  previewMeta: { color: "#00A884", fontSize: 10, fontWeight: "700", textAlign: "center" },
  storyCover: { ...StyleSheet.absoluteFillObject },
  storyScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 62,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  storyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  storyRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: LIKE_PINK,
    padding: 1.5,
    backgroundColor: palette.card,
  },
  storyRingSeen: { borderColor: "#D5D8DD" },
  storyAvatar: { width: "100%", height: "100%", borderRadius: 12 },
  storyName: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
});
