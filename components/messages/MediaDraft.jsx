import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import * as Haptics from "expo-haptics";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import Icon from "../ui/Icon";
import MediaStickerOverlay from "./MediaStickerOverlay";
import ReplyQuote from "./ReplyQuote";
import { formatDuration } from "./VoiceBubble";

const STICKERS = ["😂", "❤️", "🔥", "👍", "🎉", "😮", "😢", "✨"];
const MAX_STICKERS = 6;

function DraftVideo({ uri, stickers, onRemoveSticker }) {
  const source = useMemo(() => ({ uri, contentType: "progressive" }), [uri]);
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
  });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const subscription = player.addListener("playingChange", setPlaying);
    return () => subscription?.remove?.();
  }, [player]);

  return (
    <Pressable
      style={styles.preview}
      onPress={() => (player.playing ? player.pause() : player.play())}
      accessibilityRole="button"
      accessibilityLabel={playing ? "Pause preview" : "Play preview"}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
        surfaceType="textureView"
      />
      {!playing && (
        <View pointerEvents="none" style={styles.videoShade}>
          <View style={styles.playButton}>
            <Icon name="play" size={22} color="#FFFFFF" />
          </View>
        </View>
      )}
      <MediaStickerOverlay stickers={stickers} onRemove={onRemoveSticker} />
    </Pressable>
  );
}

function cropToRatio(width, height, ratio) {
  let cropWidth = width;
  let cropHeight = width / ratio;
  if (cropHeight > height) {
    cropHeight = height;
    cropWidth = height * ratio;
  }
  return {
    originX: Math.max(0, Math.round((width - cropWidth) / 2)),
    originY: Math.max(0, Math.round((height - cropHeight) / 2)),
    width: Math.max(1, Math.round(cropWidth)),
    height: Math.max(1, Math.round(cropHeight)),
  };
}


export default function MediaDraft({
  draft,
  replyTo,
  onCancelReply,
  onChange,
  onClose,
  onReplace,
  onSend,
  onTyping,
}) {
  const [panel, setPanel] = useState(null);
  const [editing, setEditing] = useState(false);
  const isVideo = draft.kind === "video";
  const caption = draft.caption ?? "";
  const stickers = Array.isArray(draft.stickers) ? draft.stickers : [];
  const viewOnce = draft.viewOnce === true;
  const canSend = !editing && !!draft.uri;

  const updateCaption = (value) => {
    onChange({ caption: value });
    onTyping?.(value);
  };
  const addSticker = (sticker) => {
    if (stickers.length >= MAX_STICKERS) return;
    Haptics.selectionAsync().catch(() => {});
    onChange({ stickers: [...stickers, sticker] });
  };
  const removeSticker = (index) => {
    onChange({ stickers: stickers.filter((_, i) => i !== index) });
  };
  const rotateImage = async () => {
    if (isVideo || editing) return;
    setEditing(true);
    try {
      const context = ImageManipulator.manipulate(draft.uri).rotate(90);
      const image = await context.renderAsync();
      const result = await image.saveAsync({ compress: 0.9, format: SaveFormat.JPEG });
      onChange({
        uri: result.uri,
        width: result.width,
        height: result.height,
        mimeType: "image/jpeg",
      });
    } catch (error) {
      Alert.alert("Couldn't edit photo", String(error?.message ?? error));
    } finally {
      setEditing(false);
    }
  };
  const cropImage = async (ratio, label) => {
    if (isVideo || editing || !draft.width || !draft.height) return;
    setEditing(true);
    try {
      const context = ImageManipulator.manipulate(draft.uri).crop(
        cropToRatio(draft.width, draft.height, ratio),
      );
      const image = await context.renderAsync();
      const result = await image.saveAsync({ compress: 0.9, format: SaveFormat.JPEG });
      onChange({
        uri: result.uri,
        width: result.width,
        height: result.height,
        mimeType: "image/jpeg",
      });
      setPanel(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (error) {
      Alert.alert(`Couldn't crop to ${label}`, String(error?.message ?? error));
    } finally {
      setEditing(false);
    }
  };


  return (
    <View style={styles.container}>
      {replyTo && (
        <View style={styles.replyBar}>
          <View style={styles.replyQuote}>
            <ReplyQuote replyTo={replyTo} />
          </View>
          <Pressable
            onPress={onCancelReply}
            hitSlop={8}
            style={styles.closeReply}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
          >
            <Icon name="close" size={18} color="#555555" />
          </Pressable>
        </View>
      )}
      <View style={styles.draftRow}>
        <View style={styles.previewColumn}>
          {isVideo ? (
            <DraftVideo
              uri={draft.uri}
              stickers={stickers}
              onRemoveSticker={removeSticker}
            />
          ) : draft.uri ? (
            <View style={styles.preview}>
              <Image
                source={{ uri: draft.uri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <MediaStickerOverlay
                stickers={stickers}
                onRemove={removeSticker}
              />
              {editing && <View style={styles.editingCover} />}
            </View>
          ) : (
            <View style={[styles.preview, styles.placeholder]}>
              <Icon name="image" size={28} color="#777777" />
            </View>
          )}
          <View style={styles.previewActions}>
            <Pressable
              onPress={() => setPanel(panel === "stickers" ? null : "stickers")}
              style={styles.previewAction}
              accessibilityRole="button"
              accessibilityLabel="Add sticker"
            >
              <Icon name="emoji" size={19} color="#333333" />
            </Pressable>
            <Pressable
              onPress={() => setPanel(panel === "edit" ? null : "edit")}
              disabled={isVideo}
              style={[styles.previewAction, isVideo && styles.disabled]}
              accessibilityRole="button"
              accessibilityLabel={isVideo ? "Video editing unavailable" : "Edit photo"}
            >
              <Icon name="edit" size={19} color="#333333" />
            </Pressable>
            <Pressable
              onPress={onReplace}
              style={styles.previewAction}
              accessibilityRole="button"
              accessibilityLabel="Replace media"
            >
              <Icon name="rotateCamera" size={19} color="#333333" />
            </Pressable>
          </View>
        </View>


        <View style={styles.captionWrap}>
          <TextInput
            value={caption}
            onChangeText={updateCaption}
            placeholder="Add a caption…"
            placeholderTextColor="#888888"
            style={styles.captionInput}
            multiline
            maxLength={4000}
            editable={!editing}
            accessibilityLabel="Media caption"
          />
          {!!draft.duration && (
            <Text style={styles.duration}>{formatDuration(draft.duration)}</Text>
          )}
          <Pressable
            onPress={() => onChange({ viewOnce: !viewOnce })}
            style={[styles.draftOption, viewOnce && styles.draftOptionActive]}
            accessibilityRole="button"
            accessibilityLabel={viewOnce ? "Disable view once" : "Enable view once"}
          >
            <Icon name="viewOnce" size={16} color={viewOnce ? "#FFFFFF" : "#666666"} />
            <Text style={[styles.draftOptionText, viewOnce && styles.draftOptionTextActive]}>
              {viewOnce ? "View once" : "Normal"}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Remove attachment"
        >
          <Icon name="close" size={20} color="#555555" />
        </Pressable>
        <Pressable
          onPress={() => onSend({ caption: caption.trim(), viewOnce })}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && styles.sendDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send media"
        >
          {editing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Icon name="send" size={19} color="#FFFFFF" />
          )}
        </Pressable>
      </View>


      {panel === "stickers" && (
        <View style={styles.toolPanel}>
          <Text style={styles.panelTitle}>Stickers</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stickerList}
          >
            {STICKERS.map((sticker) => (
              <Pressable
                key={sticker}
                onPress={() => addSticker(sticker)}
                disabled={stickers.length >= MAX_STICKERS}
                style={[
                  styles.stickerOption,
                  stickers.length >= MAX_STICKERS && styles.disabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Add ${sticker} sticker`}
              >
                <Text style={styles.stickerOptionText}>{sticker}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.panelHint}>Tap a sticker on the preview to remove it.</Text>
        </View>
      )}
      {panel === "edit" && !isVideo && (
        <View style={styles.toolPanel}>
          <Text style={styles.panelTitle}>Edit photo</Text>
          <View style={styles.editRow}>
            <Pressable onPress={rotateImage} style={styles.editAction} disabled={editing}>
              <Icon name="rotateCamera" size={20} color="#333333" />
              <Text style={styles.editLabel}>Rotate</Text>
            </Pressable>
            <Pressable onPress={() => cropImage(1, "Square")} style={styles.editAction} disabled={editing}>
              <Text style={styles.ratioText}>1:1</Text>
              <Text style={styles.editLabel}>Square</Text>
            </Pressable>
            <Pressable onPress={() => cropImage(4 / 5, "Portrait")} style={styles.editAction} disabled={editing}>
              <Text style={styles.ratioText}>4:5</Text>
              <Text style={styles.editLabel}>Portrait</Text>
            </Pressable>
            <Pressable onPress={() => cropImage(16 / 9, "Landscape")} style={styles.editAction} disabled={editing}>
              <Text style={styles.ratioText}>16:9</Text>
              <Text style={styles.editLabel}>Landscape</Text>
            </Pressable>
          </View>
          <Text style={styles.panelHint}>Edits are saved to a new local preview.</Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
  },
  replyBar: {
    minHeight: 52,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F8",
  },
  replyQuote: { flex: 1 },
  closeReply: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  draftRow: {
    minHeight: 112,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewColumn: { width: 82 },
  preview: {
    width: 82,
    height: 82,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#17171A",
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  previewAction: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F2",
  },
  captionWrap: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  captionInput: {
    minHeight: 48,
    maxHeight: 84,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 21,
    backgroundColor: "#F2F2F2",
    fontSize: 15,
    lineHeight: 20,
    color: "#111111",
    textAlignVertical: "center",
  },
  duration: { marginTop: 4, marginLeft: 12, fontSize: 11, color: "#777777" },
  draftOption: {
    alignSelf: "flex-start",
    minHeight: 28,
    marginTop: 5,
    paddingHorizontal: 8,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0F0F2",
  },
  draftOptionActive: { backgroundColor: "#111111" },
  draftOptionText: { fontSize: 10, fontWeight: "700", color: "#666666" },
  draftOptionTextActive: { color: "#FFFFFF" },
  closeButton: {
    width: 34,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  sendDisabled: { opacity: 0.45 },
  videoShade: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  editingCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  toolPanel: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ECECF1",
    backgroundColor: "#FAFAFB",
  },
  panelTitle: { fontSize: 12, fontWeight: "700", color: "#555555" },
  stickerList: { gap: 8, paddingVertical: 8 },
  stickerOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  stickerOptionText: { fontSize: 27 },
  panelHint: { fontSize: 10, color: "#888888" },
  editRow: { flexDirection: "row", gap: 8, paddingVertical: 8 },
  editAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    backgroundColor: "#FFFFFF",
  },
  editLabel: { fontSize: 10, color: "#666666" },
  ratioText: { fontSize: 16, fontWeight: "700", color: "#333333" },
  disabled: { opacity: 0.38 },
});

