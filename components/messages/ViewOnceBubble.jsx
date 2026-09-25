import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import Icon from "../ui/Icon";
import { viewOnceContentType, viewOnceLabel } from "./ViewOnceViewer";

export default function ViewOnceBubble({
  viewed = false,
  isMine = false,
  message,
  mediaType,
  onOpen,
  onLongPress,
}) {
  const type = mediaType ?? viewOnceContentType(message);
  const label = viewOnceLabel({ ...message, kind: type, mediaType: type });
  const accessibilityLabel = viewed
    ? "View-once message opened"
    : `Open view-once ${label.toLowerCase()}`;

  if (viewed) {
    return (
      <View style={styles.opened} accessible accessibilityLabel={accessibilityLabel}>
        <Icon name="check" size={16} color={isMine ? "#AAAAAA" : "#999999"} />
        <Text style={[styles.openedText, isMine ? styles.openedMine : styles.openedTheirs]}>
          Opened
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onOpen}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens once, then the message is removed"
    >
      <Icon
        name={type === "video" ? "video" : type === "voice" || type === "audio" ? "microphone" : "viewOnce"}
        size={20}
        color={isMine ? "#FFFFFF" : "#111111"}
      />
      <View style={styles.copy}>
        <Text style={[styles.label, isMine ? styles.labelMine : styles.labelTheirs]}>
          View-once {label.toLowerCase()}
        </Text>
        <Text style={[styles.hint, isMine ? styles.hintMine : styles.hintTheirs]}>
          Tap to open
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minWidth: 150,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 2,
  },
  copy: { flex: 1 },
  label: { fontSize: 14, fontWeight: "700" },
  labelMine: { color: "#FFFFFF" },
  labelTheirs: { color: "#111111" },
  hint: { marginTop: 2, fontSize: 10 },
  hintMine: { color: "#CCCCCC" },
  hintTheirs: { color: "#777777" },
  opened: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2 },
  openedText: { fontSize: 13, fontStyle: "italic" },
  openedMine: { color: "#AAAAAA" },
  openedTheirs: { color: "#999999" },
});
