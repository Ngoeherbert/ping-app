import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Easing } from "react-native";
import Icon from "../ui/Icon";
import { formatDuration } from "./VoiceBubble";

function formatSize(bytes) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function isPdf(mimeType, fileName) {
  const ext = (fileName?.split(".").pop() || "").toLowerCase();
  return (
    mimeType === "application/pdf" ||
    ext === "pdf"
  );
}

function isImageType(mimeType, fileName) {
  const ext = (fileName?.split(".").pop() || "").toLowerCase();
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  return (
    mimeType?.startsWith("image/") ||
    imageExts.includes(ext)
  );
}

function isVideoType(mimeType, fileName) {
  const ext = (fileName?.split(".").pop() || "").toLowerCase();
  const videoExts = ["mp4", "mov", "avi", "mkv", "webm", "m4v"];
  return (
    mimeType?.startsWith("video/") ||
    videoExts.includes(ext)
  );
}

function isVoiceType(mimeType, fileName) {
  const ext = (fileName?.split(".").pop() || "").toLowerCase();
  const audioExts = ["mp3", "wav", "m4a", "aac", "ogg", "wma"];
  return (
    mimeType?.startsWith("audio/") ||
    audioExts.includes(ext)
  );
}

export default function FileBubble({
  fileName = "document.pdf",
  fileSize,
  mimeType,
  isMine = false,
  onPress,
  downloaded = false,
  downloading = false,
  downloadError = false,
  duration: mediaDuration = 0,
}) {
  const ext = (fileName.split(".").pop() || "pdf").toLowerCase();
  const isPdfFile = isPdf(mimeType, fileName);
  const isImage = isImageType(mimeType, fileName);
  const isVideo = isVideoType(mimeType, fileName);
  const isVoice = isVoiceType(mimeType, fileName);

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (downloading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinAnim.setValue(0);
      spinAnim.stopAnimation();
    }
  }, [downloading, spinAnim]);

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
   });

  const leftIconName = isVideo ? "play" : isVoice ? "microphone" : isPdfFile ? "file" : "file";

  const renderRightIcon = () => {
    if (downloadError) {
      return <Icon name="x" size={18} color={isMine ? "#FF6B6B" : "#E5484D"} />;
    }

    if (downloading) {
      return (
        <Animated.View style={{ transform: [{ rotate: spinRotation }] }}>
          <Icon name="x" size={18} color={isMine ? "#DDDDDD" : "#555555"} />
        </Animated.View>
      );
    }

    if (!downloaded) {
      return <Icon name="download" size={18} color={isMine ? "#DDDDDD" : "#555555"} />;
    }

    if (downloaded && isImage) {
      return null;
    }

    if (downloaded && isVideo) {
      return <Icon name="play" size={18} color={isMine ? "#DDDDDD" : "#555555"} />;
    }

    if (downloaded && isPdfFile) {
      return <Icon name="file" size={18} color={isMine ? "#DDDDDD" : "#555555"} />;
    }

    if (downloaded && isVoice) {
      return <Icon name="microphone" size={18} color={isMine ? "#DDDDDD" : "#555555"} />;
    }

    return <Icon name="download" size={18} color={isMine ? "#DDDDDD" : "#555555"} />;
  };

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.tile, isMine ? styles.tileMine : styles.tileTheirs]}>
        <Icon
          name={leftIconName}
          size={22}
          color={isMine ? "#FFFFFF" : "#111111"}
        />
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
        {isVideo && mediaDuration > 0 && (
          <Text style={[styles.sub, isMine ? styles.subMine : styles.subTheirs]}>
            {formatDuration(mediaDuration)}
          </Text>
        )}
      </View>
      {renderRightIcon()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0, maxWidth: "100%", flexShrink: 1 },
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
