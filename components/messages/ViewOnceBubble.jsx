import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Icon from "../ui/Icon";

export default function ViewOnceBubble({ viewed = false, isMine = false, mediaType = "photo", onOpen }) {
  if (viewed) {
    return (
      <View style={styles.opened}>
        <Icon name="check" size={16} color={isMine ? "#AAAAAA" : "#999999"} />
        <Text style={[styles.openedText, isMine ? styles.openedMine : styles.openedTheirs]}>
          Opened
        </Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onOpen} style={styles.row}>
      <Icon
        name={mediaType === "video" ? "video" : mediaType === "voice" ? "microphone" : "viewOnce"}
        size={20}
        color={isMine ? "#FFFFFF" : "#111111"}
      />
      <View>
        <Text style={[styles.label, isMine ? styles.labelMine : styles.labelTheirs]}>
          {mediaType}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 70 },
  label: { fontSize: 14, fontWeight: "700" },
  labelMine: { color: "#FFFFFF" },
  labelTheirs: { color: "#111111" },
  opened: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2 },
  openedText: { fontSize: 13, fontStyle: "italic" },
  openedMine: { color: "#AAAAAA" },
  openedTheirs: { color: "#999999" },
});
