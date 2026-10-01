import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "../ui/Icon";

/** Shared, non-blank fallback for a story whose content cannot be shown. */
export default function StoryFallback({ icon = "info", title, sub }) {
  return (
    <View style={s.wrap}>
      <View style={s.badge}>
        <Icon name={icon} size={38} color="#00A884" />
      </View>
      <Text style={s.title}>{title}</Text>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111B21",
    paddingHorizontal: 32,
    gap: 10,
  },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(0,168,132,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", textAlign: "center" },
  sub: { color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center", lineHeight: 18 },
});