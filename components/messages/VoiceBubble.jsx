import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAudioPlayer } from "expo-audio";
import Icon from "../ui/Icon";

export function formatDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

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

export default function VoiceBubble({
  uri,
  duration = 0,
  isMine = false,
  waveform,
  time,
  status,
}) {
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

  const showStatus = isMine && !!status;
  const hasMeta = !!time || showStatus;

  return (
    <View>
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

        <Icon name="microphone" size={14} color={isMine ? "#AAAAAA" : "#999999"} />
      </View>

      {hasMeta && (
        <View style={styles.metaRow}>
          <Text style={[styles.dur, isMine ? styles.durMine : styles.durTheirs]}>
            {formatDuration(duration)}
          </Text>
          <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
            {time}
          </Text>
          {showStatus && (
            <Icon name="check" size={13} color={isMine ? "#DDDDDD" : "#777777"} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 190,
  },
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

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginLeft: 42,
  },
  dur: { fontSize: 11, fontWeight: "600" },
  durMine: { color: "#DDDDDD" },
  durTheirs: { color: "#666666" },
  time: { fontSize: 10 },
  timeMine: { color: "#AAAAAA" },
  timeTheirs: { color: "#999999" },
});
