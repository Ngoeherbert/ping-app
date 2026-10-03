import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Icon from "../ui/Icon";
import { storyKind } from "../../lib/stores/storyStore";
import { TEXT_FONTS, fmtDur, linkDomain } from "./create/constants";

const WA = "#00A884";

/**
 * Content preview for a story that has no photo — real text, a link card, or
 * voice-note details — so a story reads as itself instead of a generic type
 * icon. Shared by the Home story row and the My Stories list.
 *
 * `compact` is the small circular variant used by My Stories; the full-tile
 * variant has footer clearance built in.
 */
export default function StoryContentPreview({ story, compact = false }) {
  const kind = storyKind(story);

  if (kind === "text") {
    const body = String(story.text ?? story.caption ?? "").trim();
    const weight = TEXT_FONTS.find((f) => f.key === story.font)?.weight ?? "700";
    return (
      <View
        style={[
          p.fill,
          p.fallback,
          compact && p.fallbackCompact,
          { backgroundColor: story.bg ?? "#111B21" },
        ]}
      >
        {body ? (
          <Text
            style={[
              p.text,
              compact && p.textCompact,
              { color: story.textColor ?? "#FFFFFF", fontWeight: weight },
            ]}
            numberOfLines={compact ? 3 : 4}
          >
            {body}
          </Text>
        ) : (
          <Icon name="edit" size={compact ? 16 : 30} color={WA} />
        )}
      </View>
    );
  }

  if (kind === "link") {
    const url = story.url ?? story.link ?? null;
    const valid = /^https?:\/\/\S+$/i.test(String(url ?? ""));
    const domain = valid ? linkDomain(url) : "Link unavailable";
    return (
      <View style={[p.fill, p.fallback, compact && p.fallbackCompact]}>
        {story.thumbnail && !compact ? (
          <Image source={{ uri: story.thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <View
          style={[
            p.overlay,
            compact && p.overlayCompact,
            !!story.thumbnail && !compact && p.overlayDim,
          ]}
        >
          <View style={[p.icon, compact && p.iconCompact]}>
            <Icon name="link" size={compact ? 12 : 18} color={WA} />
          </View>
          {compact ? null : (
            <>
              <Text style={p.title} numberOfLines={2}>{story.title ?? domain}</Text>
              <Text style={p.meta} numberOfLines={1}>{domain}</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  if (kind === "audio") {
    return (
      <View style={[p.fill, p.fallback, compact && p.fallbackCompact]}>
        <View style={[p.overlay, compact && p.overlayCompact]}>
          <View style={[p.icon, !compact && p.iconLg]}>
            <Icon name="mic" size={compact ? 16 : 24} color={WA} />
          </View>
          {compact ? null : (
            <>
              <Text style={p.title} numberOfLines={2}>{story.title ?? "Voice note"}</Text>
              <Text style={p.meta}>{story.duration ? fmtDur(story.duration) : "Voice"}</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[p.fill, p.fallback, compact && p.fallbackCompact]}>
      <Icon name="image" size={compact ? 16 : 30} color={WA} />
    </View>
  );
}

const p = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  // paddingBottom keeps the full-tile variant clear of the avatar/name footer.
  fallback: {
    backgroundColor: "#111B21",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingBottom: 46,
  },
  fallbackCompact: { paddingHorizontal: 2, paddingBottom: 0 },
  text: { textAlign: "center", fontSize: 15, lineHeight: 20 },
  textCompact: { fontSize: 8, lineHeight: 10 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingBottom: 46,
  },
  overlayCompact: { paddingHorizontal: 0, paddingBottom: 0, gap: 0 },
  overlayDim: { backgroundColor: "rgba(12,20,26,0.82)" },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,168,132,0.16)",
  },
  iconCompact: { width: 22, height: 22, borderRadius: 11 },
  iconLg: { width: 44, height: 44, borderRadius: 22 },
  title: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", textAlign: "center" },
  meta: { color: WA, fontSize: 10, fontWeight: "700", textAlign: "center" },
});