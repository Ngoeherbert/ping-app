import React, { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import Icon from "../ui/Icon";
import MediaStickerOverlay from "./MediaStickerOverlay";
import { CAPTION_PAD_H, MEDIA_HEIGHT, MEDIA_WIDTH } from "./media";

export default function ImageBubble({
  uri,
  caption,
  isMine = false,
  onPress,
  onLongPress,
  bleed = true,
  stickers = [],
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  if (!uri) return null;

  const retry = () => {
    setFailed(false);
    setLoaded(false);
    setAttempt((n) => n + 1);
  };

  const handlePress = () => {
    if (failed) {
      retry();
      return;
    }
    onPress?.();
  };

  return (
    <View style={[styles.wrap, !bleed && styles.wrapFlush]}>
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={400}
        style={styles.mediaWrap}
      >
        <Image
          key={attempt}
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => {
            setLoaded(true);
            setFailed(false);
          }}
          onError={() => setFailed(true)}
        />
        {/* Dark cover until the image bytes arrive — mirrors the
            video tile so both media types feel identical. */}
        {!loaded && !failed && <View style={styles.cover} pointerEvents="none" />}
        {failed && (
          <View style={[styles.cover, styles.center]} pointerEvents="none">
            <View style={styles.iconBtn}>
              <Icon name="image" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.retryHint}>Tap to retry</Text>
          </View>
        )}

        {/* Image icon overlay, top-left corner */}
        {loaded && !failed && (
          <View style={styles.iconOverlay} pointerEvents="none">
            <Icon name="image" size={18} color="#FFFFFF" />
          </View>
        )}
        <MediaStickerOverlay stickers={stickers} />
      </Pressable>
      {/* Caption sits under the tile (same as the video bubble) and is
          pinned to the media width so long text wraps instead of
          stretching the bubble wider than the image. */}
      {!!caption && (
        <Text
          style={[
            styles.caption,
            isMine ? styles.captionMine : styles.captionTheirs,
          ]}
        >
          {caption}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: -13, marginTop: -9, marginBottom: 4 },
  // Caption-less media has no bubble padding to bleed into.
  wrapFlush: { marginHorizontal: 0, marginTop: 0, marginBottom: 0 },
  mediaWrap: { borderRadius: 18, overflow: "hidden" },
  image: {
    width: MEDIA_WIDTH,
    height: MEDIA_HEIGHT,
    backgroundColor: "#1A1A1E",
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1A1A1E",
  },
  center: { alignItems: "center", justifyContent: "center" },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  retryHint: { marginTop: 8, fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
  caption: {
    width: MEDIA_WIDTH,
    fontSize: 14,
    lineHeight: 19,
    paddingHorizontal: CAPTION_PAD_H,
    paddingTop: 8,
  },
  captionMine: { color: "#FFFFFF" },
  captionTheirs: { color: "#222222" },
});
