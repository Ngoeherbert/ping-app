import React, { useEffect, useMemo } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";

import Icon from "../ui/Icon";

export default function ImagePreviewScreen({
  visible = false,
  draft,
  receiverName = "Recipient",
  onChange,
  onAdd,
  onClose,
  onSend,
  onTyping,
}) {
  const mediaItems = Array.isArray(draft?.assets) && draft.assets.length
    ? draft.assets
    : draft?.uri
      ? [draft]
      : [];
  const primaryMedia = mediaItems[0] ?? null;
  const primaryKind = primaryMedia?.kind === "video" || primaryMedia?.type === "video"
    || primaryMedia?.mimeType?.startsWith("video/")
    ? "video"
    : "image";
  const videoSource = useMemo(
    () => primaryKind === "video" && primaryMedia?.uri
      ? { uri: primaryMedia.uri, contentType: "progressive" }
      : null,
    [primaryKind, primaryMedia?.uri],
  );
  const player = useVideoPlayer(videoSource);
  const caption = String(draft?.caption ?? "");
  const viewOnce = draft?.viewOnce === true;
  const canSend = mediaItems.length > 0;

  useEffect(() => {
    if (visible) Keyboard.dismiss();
  }, [visible]);

  const updateCaption = (value) => {
    onChange?.({ caption: value });
    onTyping?.(value);
  };

  const submit = () => {
    if (canSend) onSend?.({ caption: caption.trim(), viewOnce });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close image preview">
            <Icon name="close" size={22} color="#111111" />
          </Pressable>
          <Text style={styles.headerTitle}>Preview</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.previewArea}>
          {primaryMedia?.uri && primaryKind === "video" ? (
            <VideoView
              player={player}
              style={styles.previewImage}
              contentFit="contain"
              nativeControls
              fullscreenOptions={{ enable: false }}
              surfaceType="textureView"
            />
          ) : primaryMedia?.uri ? (
            <Image source={{ uri: primaryMedia.uri }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.unavailable}>
              <Icon name="image" size={42} color="#777777" />
              <Text style={styles.unavailableText}>Image unavailable</Text>
            </View>
          )}
          {mediaItems.length > 1 && (
            <View style={styles.countBadge} pointerEvents="none">
              <Text style={styles.countText}>{mediaItems.length} selected</Text>
            </View>
          )}
        </View>

        <KeyboardAvoidingView
          style={styles.bottomPanel}
          behavior={Platform.select({ ios: "padding", android: undefined })}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputShell}>
            <Pressable
              onPress={onAdd}
              style={styles.addButton}
              accessibilityRole="button"
              accessibilityLabel="Add more images or videos"
            >
              <Icon name="plus" size={20} color="#555555" />
            </Pressable>
            <TextInput
              value={caption}
              onChangeText={updateCaption}
              placeholder="Add a caption…"
              placeholderTextColor="#888888"
              style={styles.captionInput}
              multiline
              maxLength={4000}
              accessibilityLabel="Image caption"
            />
            <Pressable
              onPress={() => onChange?.({ viewOnce: !viewOnce })}
              style={[styles.viewOnceButton, viewOnce && styles.viewOnceButtonActive]}
              accessibilityRole="button"
              accessibilityLabel={viewOnce ? "Disable view once" : "Enable view once"}
            >
              <Icon name="viewOnce" size={19} color={viewOnce ? "#FFFFFF" : "#666666"} />
            </Pressable>
          </View>

          <View style={styles.receiverRow}>
            <View style={styles.receiverCopy}>
              <Text style={styles.receiverLabel}>To</Text>
              <Text style={styles.receiverName} numberOfLines={1}>{receiverName}</Text>
            </View>
            <Pressable
              onPress={submit}
              disabled={!canSend}
              style={[styles.sendButton, !canSend && styles.sendDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Send image"
            >
              <Icon name="send" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111111" },
  headerSpacer: { width: 42 },
  previewArea: { flex: 1, minHeight: 220, backgroundColor: "#111111", position: "relative" },
  previewImage: { flex: 1, width: "100%", height: "100%" },
  countBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  countText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  unavailable: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  unavailableText: { color: "#BBBBBB", fontSize: 14 },
  bottomPanel: { paddingHorizontal: 12, paddingTop: 10, backgroundColor: "#FFFFFF" },
  inputShell: {
    minHeight: 52,
    paddingHorizontal: 5,
    borderRadius: 26,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  captionInput: { flex: 1, minWidth: 0, maxHeight: 96, paddingHorizontal: 8, paddingVertical: 10, fontSize: 15, lineHeight: 20, color: "#111111" },
  viewOnceButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  viewOnceButtonActive: { backgroundColor: "#111111" },
  receiverRow: { minHeight: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  receiverCopy: { flex: 1, minWidth: 0 },
  receiverLabel: { fontSize: 11, color: "#888888" },
  receiverName: { marginTop: 2, fontSize: 15, fontWeight: "700", color: "#111111" },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "#111111" },
  sendDisabled: { opacity: 0.4 },
});
