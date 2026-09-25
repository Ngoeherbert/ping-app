import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function messagePreview(message) {
  const kind = message?.kind ?? message?.type;
  const isViewOnce = message?.viewOnce === true || ["view-once", "view_once", "viewonce"].includes(kind);

  if (isViewOnce) {
    if (message?.mediaType === "text" || kind === "text") return "View-once text";
    if (message?.mediaType === "video" || kind === "video") return "View-once video";
    if (["voice", "audio"].includes(message?.mediaType) || ["voice", "audio"].includes(kind)) {
      return "View-once voice message";
    }
    if (["file", "document"].includes(message?.mediaType) || ["file", "document"].includes(kind)) {
      return "View-once file";
    }
    return "View-once photo";
  }

  const text = message?.text ?? message?.caption ?? message?.message;
  if (String(text ?? "").trim()) return String(text).trim();

  switch (kind) {
    case "image":
    case "photo":
      return "Photo";
    case "video":
      return "Video";
    case "voice":
    case "audio":
      return "Voice message";
    case "file":
    case "pdf":
    case "document":
      return message?.fileName ?? message?.name ?? "File";
    case "view-once":
    case "view_once":
    case "viewonce":
      return "View-once media";
    default:
      return "Message";
  }
}

export default function ReplyQuote({ replyTo, isMine = false }) {
  if (!replyTo) return null;

  const sender = replyTo.senderName ?? (replyTo.isMine ? "You" : "Them");
  const preview = replyTo.preview ?? messagePreview(replyTo);

  return (
    <View style={[styles.container, isMine ? styles.mine : styles.theirs]}>
      <View style={[styles.bar, isMine ? styles.mineBar : styles.theirBar]} />
      <View style={styles.copy}>
        <Text
          numberOfLines={1}
          style={[styles.sender, isMine ? styles.mineSender : styles.theirSender]}
        >
          {sender}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.preview, isMine ? styles.minePreview : styles.theirPreview]}
        >
          {preview}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 132,
    maxWidth: 230,
    marginBottom: 7,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 9,
    flexDirection: "row",
    overflow: "hidden",
  },
  mine: { backgroundColor: "rgba(255,255,255,0.13)" },
  theirs: { backgroundColor: "rgba(0,0,0,0.07)" },
  bar: { width: 3, borderRadius: 2, marginRight: 8 },
  mineBar: { backgroundColor: "#69D98B" },
  theirBar: { backgroundColor: "#5B57FF" },
  copy: { flex: 1, minWidth: 0 },
  sender: { fontSize: 12, fontWeight: "700" },
  mineSender: { color: "#D8FFE4" },
  theirSender: { color: "#3730A3" },
  preview: { marginTop: 1, fontSize: 12 },
  minePreview: { color: "#E8E8E8" },
  theirPreview: { color: "#555555" },
});

