import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Icon from "../ui/Icon";

function formatSize(bytes) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const EXT_ICON = { pdf: "file-text", doc: "file-text", docx: "file-text", xls: "file-text", xlsx: "file-text", zip: "file" };

export default function FileBubble({ fileName = "document.pdf", fileSize, mimeType, isMine = false, onPress }) {
  const ext = (fileName.split(".").pop() || "pdf").toLowerCase();
  const icon = EXT_ICON[ext] && ["file-text"].includes(EXT_ICON[ext]) ? "file" : "file";

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.tile, isMine ? styles.tileMine : styles.tileTheirs]}>
        <Icon name={icon} size={22} color={isMine ? "#FFFFFF" : "#111111"} />
        <View style={styles.extBadge}>
          <Text style={styles.extText}>{ext.slice(0, 3).toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <Text
          style={[styles.name, isMine ? styles.nameMine : styles.nameTheirs]}
          numberOfLines={1}
        >
          {fileName}
        </Text>
        <Text style={[styles.sub, isMine ? styles.subMine : styles.subTheirs]}>
          {[formatSize(fileSize), mimeType === "application/pdf" ? "PDF" : mimeType]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </View>
      <Icon name="download" size={18} color={isMine ? "#DDDDDD" : "#555555"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 200 },
  tile: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tileMine: { backgroundColor: "rgba(255,255,255,0.18)" },
  tileTheirs: { backgroundColor: "#FFFFFF" },
  extBadge: {
    position: "absolute",
    bottom: 4,
    backgroundColor: "#E5484D",
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  extText: { color: "#fff", fontSize: 7, fontWeight: "800" },
  meta: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: "600" },
  nameMine: { color: "#FFFFFF" },
  nameTheirs: { color: "#111111" },
  sub: { fontSize: 12, marginTop: 2 },
  subMine: { color: "#BBBBBB" },
  subTheirs: { color: "#777777" },
});
