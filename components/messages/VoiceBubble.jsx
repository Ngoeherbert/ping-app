import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAudioPlayer } from "expo-audio";
import Icon from "../ui/Icon";

function formatDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

// Deterministic fake waveform so every voice note looks alive
// even when the backend doesn't send metering data.
function barsFor(duration, count = 28) {
  const bars = [];
  let seed = Math.max(1, Math.round(duration * 7) + 13);
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807) % 2147483647;
    const v = 0.25 + ((seed % 100) / 100) * 0.75;
    bars.push(v);
  }
  return bars;
}

export default function VoiceBubble({ uri, duration = 0, isMine = false, waveform }) {
  const player = useAudioPlayer(uri ? { uri } : null);
  const [playing, setPlaying] = useState(false);
  const bars = waveform ?? barsFor(duration);

  const toggle = async () => {
    try {
      if (playing) {
        player.pause();
        setPlaying(false);
      } else {
        player.seekTo(0);
        player.play();
        setPlaying(true);
        player.addListener?.("playbackStatusUpdate", (s) => {
          if (s?.didJustFinish) setPlaying(false);
        });
      }
    } catch {
      setPlaying((p) => !p);
    }
  };

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? "Pause voice note" : "Play voice note"}
        onPress={toggle}
        style={[styles.play, isMine ? styles.playMine : styles.playTheirs]}
      >
        <Icon
          name={playing ? "pause" : "play"}
          size={16}
          color={isMine ? "#FFFFFF" : "#111111"}
        />
      </Pressable>

      <View style={styles.wave}>
        {bars.map((v, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { height: 4 + v * 20 },
              isMine ? styles.barMine : styles.barTheirs,
              i < (playing ? bars.length : 0) && styles.barActive,
            ]}
          />
        ))}
      </View>

      <Text style={[styles.dur, isMine ? styles.durMine : styles.durTheirs]}>
        {formatDuration(duration)}
      </Text>

      <Icon name="microphone" size={14} color={isMine ? "#AAAAAA" : "#999999"} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 190 },
  play: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  playMine: { backgroundColor: "rgba(255,255,255,0.22)" },
  playTheirs: { backgroundColor: "#FFFFFF" },
  wave: { flex: 1, flexDirection: "row", alignItems: "center", gap: 2 },
  bar: { width: 2.5, borderRadius: 2, opacity: 0.55 },
  barMine: { backgroundColor: "#FFFFFF" },
  barTheirs: { backgroundColor: "#111111" },
  barActive: { opacity: 1 },
  dur: { fontSize: 11, fontWeight: "600", marginLeft: 2 },
  durMine: { color: "#DDDDDD" },
  durTheirs: { color: "#666666" },
});
