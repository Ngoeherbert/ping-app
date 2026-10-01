import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Haptics from "expo-haptics";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import { formatDuration } from "../messages/VoiceBubble";
import StoryFallback from "./StoryFallback";

/**
 * Audio story content: visible player UI with play/pause, progress and times.
 * Autoplays when active, follows the viewer's pause state, reports progress
 * for the viewer's progress bar and fires onFinish exactly once at the end.
 */
export default function StoryAudioContent({ uri, title, duration = 0, author, paused, onProgress, onFinish }) {
  const player = useAudioPlayer(uri ? { uri } : null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [failed, setFailed] = useState(!uri);
  const finishedRef = useRef(false);

  // Autoplay when active; follow the viewer's pause/resume.
  useEffect(() => {
    if (!uri || failed) return;
    if (!status?.isLoaded) return;
    try {
      if (paused) player.pause();
      else if (!finishedRef.current) player.play();
    } catch {
      setFailed(true);
    }
  }, [paused, status?.isLoaded, uri, failed, player]);

  // Progress + advance-on-finish (double-advance is guarded here and in the viewer).
  useEffect(() => {
    if (!status) return;
    const total = status.duration || duration || 0;
    if (total > 0 && status.currentTime > 0) {
      onProgress?.(Math.min(Math.max(status.currentTime / total, 0), 1));
    }
    if (status.didJustFinish && !finishedRef.current) {
      finishedRef.current = true;
      onProgress?.(1);
      onFinish?.();
    }
  }, [status, duration, onProgress, onFinish]);

  const playing = !!status?.playing && !paused;
  const toggle = () => {
    Haptics.selectionAsync().catch(() => {});
    try {
      if (playing) {
        player.pause();
        return;
      }
      if (finishedRef.current) {
        finishedRef.current = false;
        player.seekTo(0);
      }
      player.play();
    } catch {
      setFailed(true);
    }
  };

  if (failed) {
    return <StoryFallback icon="mic" title="Audio unavailable" sub="This voice story could not be played." />;
  }

  const total = status?.duration || duration || 0;
  const current = status?.currentTime || 0;
  const frac = total > 0 ? Math.min(current / total, 1) : 0;

  return (
    <View style={s.wrap}>
      <View style={s.card}>
        <Avatar uri={author?.avatar} name={author?.name ?? "You"} size={54} />
        <Text style={s.title} numberOfLines={1}>
          {title ?? "Voice message"}
        </Text>
        {status?.isLoaded ? (
          <View style={s.body}>
            <View style={s.track}>
              <View style={[s.fill, { width: `${(frac * 100).toFixed(1)}%` }]} />
            </View>
            <View style={s.times}>
              <Text style={s.time}>{formatDuration(current)}</Text>
              <Text style={s.time}>{formatDuration(total)}</Text>
            </View>
            <Pressable
              onPress={toggle}
              style={s.playBtn}
              accessibilityRole="button"
              accessibilityLabel={playing ? "Pause voice story" : "Play voice story"}
            >
              <Icon name={playing ? "pause" : "play"} size={26} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <ActivityIndicator color="#00A884" size="large" style={{ marginVertical: 18 }} />
        )}
      </View>
      <Text style={s.hint}>{playing ? "Playing voice story" : "Tap play to listen"}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 22, gap: 14 },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(17,27,33,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  body: { alignSelf: "stretch", gap: 8 },
  track: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3, backgroundColor: "#00A884" },
  times: { flexDirection: "row", justifyContent: "space-between" },
  time: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontVariant: ["tabular-nums"] },
  playBtn: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#00A884",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  hint: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600" },
});