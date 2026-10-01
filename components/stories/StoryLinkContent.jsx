import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { openURL } from "expo-linking";
import * as Haptics from "expo-haptics";
import Icon from "../ui/Icon";
import { linkDomain } from "./create/constants";

/**
 * Link story content: a tappable card built from whatever preview data the
 * story carries. Never auto-opens — only a tap navigates to the URL.
 */
export default function StoryLinkContent({ story }) {
  const url = story.url ?? story.link ?? null;
  const valid = /^https?:\/\/\S+$/i.test(String(url ?? ""));
  const domain = valid ? linkDomain(url) : null;
  const title = story.title ?? (valid ? domain : "Invalid link");
  const description = story.description ?? (valid ? String(url) : "This story's link could not be opened.");

  const open = () => {
    if (!valid) return;
    Haptics.selectionAsync().catch(() => {});
    openURL(url).catch(() => {});
  };

  return (
    <View style={s.wrap}>
      <Pressable
        onPress={open}
        disabled={!valid}
        style={[s.card, !valid && s.cardOff]}
        accessibilityRole={valid ? "link" : "text"}
        accessibilityLabel={valid ? `Open link ${domain}` : "Invalid link"}
      >
        {story.thumbnail ? (
          <Image source={{ uri: story.thumbnail }} style={s.thumb} contentFit="cover" />
        ) : (
          <View style={s.thumbFallback}>
            <Icon name={valid ? "link" : "info"} size={30} color="#00A884" />
          </View>
        )}
        <View style={s.meta}>
          <Text style={s.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={s.domain} numberOfLines={1}>
            {valid ? domain : "Preview unavailable"}
          </Text>
          {description ? (
            <Text style={s.desc} numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <Text style={s.hint}>{valid ? "Tap to open in your browser" : "Link unavailable"}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 22, gap: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(17,27,33,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 14,
  },
  cardOff: { opacity: 0.75 },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: "#1F2C34" },
  thumbFallback: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "rgba(0,168,132,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { flex: 1, minWidth: 0, gap: 2 },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  domain: { color: "#00A884", fontSize: 13, fontWeight: "700" },
  desc: { color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 18, marginTop: 2 },
  hint: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600" },
});