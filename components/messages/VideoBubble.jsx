import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import Icon from "../ui/Icon";
import { formatDuration } from "./VoiceBubble";
import { CAPTION_PAD_H, MEDIA_HEIGHT, MEDIA_WIDTH } from "./media";

export default function VideoBubble({
  uri,
  caption,
  isMine = false,
  bleed = true,
  duration: videoDuration = 0,
}) {
  const player = useVideoPlayer(
    uri ? { uri, contentType: "progressive" } : null,
    (p) => {
      p.loop = false;
    },
  );
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setError(null);
    setReady(false);
    setPlaying(false);
    const subs = [
      player.addListener("playingChange", (isPlaying) => setPlaying(isPlaying)),
      player.addListener("statusChange", (payload) => {
        if (payload?.status === "readyToPlay") {
          setReady(true);
          setError(null);
        }
        if (payload?.status === "error") setError(payload?.error ?? true);
      }),
    ];
    return () => subs.forEach((s) => s?.remove?.());
  }, [player, uri]);

  if (!uri) return null;

  const showFallback = !!error && !ready;

  const toggle = () => {
    try {
      if (player.playing) player.pause();
      else player.play();
    } catch {}
  };

  return (
    <View style={[styles.wrap, !bleed && styles.wrapFlush]}>
      <Pressable onPress={toggle} style={styles.videoWrap}>
        {/* Native surface stays mounted (so first frame loads) but is
            hidden under our cover until the video is ready — the native
            placeholder glyph never shows through. */}
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          surfaceType="textureView"
        />
        {(!ready || !playing) && !showFallback && (
          <View
            style={[
              styles.overlay,
              { backgroundColor: ready ? "rgba(0,0,0,0.15)" : "#1A1A1E" },
            ]}
            pointerEvents="none"
          >
            <View style={styles.videoIconRow}>
              <View style={styles.videoIconWrap}>
                <Icon name="video" size={22} color="#FFFFFF" />
              </View>
              {!!videoDuration && videoDuration > 0 && (
                <Text style={styles.duration}>{formatDuration(videoDuration)}</Text>
              )}
            </View>
            <View style={styles.playBtn}>
              <Icon name="play" size={22} color="#FFFFFF" />
            </View>
          </View>
        )}
        {showFallback && (
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.playBtn}>
              <Icon name="play" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.retryHint}>Tap to retry</Text>
          </View>
        )}
      </Pressable>
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
  videoWrap: { borderRadius: 18, overflow: "hidden" },
  video: { width: MEDIA_WIDTH, height: MEDIA_HEIGHT, backgroundColor: "#000" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  videoIconRow: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  videoIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  duration: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  playBtn: {
    position: "absolute",
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  retryHint: { marginTop: 8, fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
  // Pinned to the media width so a long caption wraps instead of
  // stretching the bubble wider than the video tile.
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
