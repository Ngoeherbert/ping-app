import React, { useEffect } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Icon from "../ui/Icon";
import VoiceBubble from "./VoiceBubble";

const CONTENT_LABELS = {
  text: "Text",
  image: "Photo",
  photo: "Photo",
  video: "Video",
  voice: "Voice message",
  audio: "Voice message",
  file: "File",
  document: "File",
};

export function viewOnceContentType(message) {
  const kind = message?.kind ?? message?.type;
  if (["view-once", "view_once", "viewonce"].includes(kind)) {
    if (message?.contentType) return message.contentType;
    if (message?.mediaType === "video") return "video";
    if (["voice", "audio"].includes(message?.mediaType)) return "voice";
    if (message?.mediaType === "text") return "text";
    if (["file", "document"].includes(message?.mediaType)) return "file";
    return "image";
  }
  return kind ?? "image";
}

export function viewOnceLabel(message) {
  return CONTENT_LABELS[viewOnceContentType(message)] ?? "Media";
}

export default function ViewOnceViewer({ visible, message, onClose }) {
  const insets = useSafeAreaInsets();
  const contentType = viewOnceContentType(message);
  const source = message?.uri;
  const player = useVideoPlayer(
    contentType === "video" && source
      ? { uri: source, contentType: "progressive" }
      : null,
  );

  useEffect(() => {
    if (!visible || contentType !== "video" || !source) return;
    try {
      player.play();
    } catch {
      // The player may be released during a fast refresh/unmount.
    }
  }, [contentType, player, source, visible]);

  if (!visible) return null;

  const openFile = async () => {
    try {
      await Linking.openURL(source);
    } catch {
      // It is still consumed if this platform cannot open the file.
    } finally {
      onClose();
    }
  };

  const renderContent = () => {
    switch (contentType) {
      case "text":
        return (
          <Text selectable={false} style={styles.textContent}>
            {message?.text ?? message?.message ?? ""}
          </Text>
        );
      case "image":
      case "photo":
        return source ? (
          <Image source={{ uri: source }} resizeMode="contain" style={styles.imageContent} />
        ) : null;
      case "video":
        return source ? (
          <VideoView
            player={player}
            style={styles.videoContent}
            contentFit="contain"
            nativeControls
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture={false}
            surfaceType="textureView"
          />
        ) : null;
      case "voice":
      case "audio":
        return source ? (
          <View style={styles.voiceCard}>
            <VoiceBubble
              uri={source}
              duration={message?.duration ?? 0}
              waveform={message?.waveform}
            />
          </View>
        ) : null;
      case "file":
      case "document":
        return (
          <Pressable
            onPress={openFile}
            style={styles.fileCard}
            accessibilityRole="button"
            accessibilityLabel={`Open ${message?.fileName ?? "file"}`}
          >
            <Icon name="file" size={42} color="#FFFFFF" />
            <Text numberOfLines={2} style={styles.fileName}>
              {message?.fileName ?? message?.name ?? "Document"}
            </Text>
            <Text style={styles.openLabel}>Open file</Text>
          </Pressable>
        );
      default:
        return <Text style={styles.missingText}>This media is unavailable.</Text>;
    }
  };

  const hasContent = contentType === "text"
    ? String(message?.text ?? message?.message ?? "").trim().length > 0
    : Boolean(source);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.badge}>
            <Icon name="viewOnce" size={17} color="#FFFFFF" />
            <Text style={styles.badgeText}>View once</Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close and remove view-once message"
          >
            <Icon name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.content}>
          {hasContent ? renderContent() : (
            <View style={styles.unavailable}>
              <Icon name="viewOnce" size={42} color="#777777" />
              <Text style={styles.missingText}>This message is no longer available.</Text>
            </View>
          )}
        </View>
        <Text style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          Close this screen to remove the message.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  badgeText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  closeButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, width: "100%", justifyContent: "center" },
  textContent: {
    marginHorizontal: 28,
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 34,
    textAlign: "center",
  },
  imageContent: { width: "100%", height: "100%" },
  videoContent: { width: "100%", height: "100%" },
  voiceCard: {
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 22,
    backgroundColor: "#242424",
  },
  fileCard: { alignSelf: "center", alignItems: "center", gap: 12, padding: 28 },
  fileName: {
    maxWidth: 260,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  openLabel: { color: "#BDBDBD", fontSize: 13 },
  unavailable: { alignItems: "center", gap: 14 },
  missingText: { color: "#BDBDBD", fontSize: 15, textAlign: "center" },
  footer: { paddingHorizontal: 20, color: "#8A8A8A", fontSize: 11, textAlign: "center" },
});
