import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

import Icon from "../ui/Icon";
import { palette } from "../../constants/colors";

function clock(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * AiVoiceBar — the voice-conversation composer for the AI chat.
 *
 * Deliberately not MessageComposer: an AI voice session has no text field, no
 * view-once, no attachments and no emoji panel. You tap, you talk, you tap
 * again and the take is sent — the same loop as ChatGPT or Meta AI voice mode.
 * There is no preview step, because there is no message to review.
 *
 * @param recording  is a take running right now
 * @param duration   seconds elapsed on the current take
 * @param onStart    begin listening
 * @param onStop     finish and send
 * @param onDiscard  throw the take away without sending it
 * @param hint       idle caption, defaults to a generic prompt
 */
export default function AiVoiceBar({
  recording = false,
  duration = 0,
  onStart,
  onStop,
  onDiscard,
  hint = "Tap the mic to talk",
}) {
  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (recording) onStop?.();
    else onStart?.();
  };

  return (
    <View style={[styles.bar, recording && styles.barRecording]}>
      {recording ? (
        <>
          <View style={styles.dot} />
          <Text style={styles.listening}>Listening</Text>
          <Text style={styles.timer}>{clock(duration)}</Text>

          <Pressable
            onPress={onDiscard}
            style={styles.discard}
            accessibilityRole="button"
            accessibilityLabel="Discard recording"
          >
            <Icon name="delete" size={19} color="#E5484D" />
          </Pressable>
        </>
      ) : (
        <Text numberOfLines={1} style={styles.hint}>
          {hint}
        </Text>
      )}

      <Pressable
        onPress={toggle}
        style={[styles.mic, recording && styles.micRecording]}
        accessibilityRole="button"
        accessibilityLabel={recording ? "Stop and send" : "Start talking"}
        accessibilityHint={
          recording ? "Sends what you just said" : "Starts listening to you"
        }
      >
        {recording ? (
          <View style={styles.stopGlyph} />
        ) : (
          <Icon name="microphone" size={22} color="#FFFFFF" />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 7,
    backgroundColor: palette.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },

  barRecording: { backgroundColor: "#FDECEC" },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E5484D",
  },
  listening: { fontSize: 14, fontWeight: "600", color: "#E5484D" },
  timer: { fontSize: 14, fontWeight: "700", color: "#E5484D" },

  discard: {
    width: 36,
    height: 36,
    marginLeft: "auto",
    alignItems: "center",
    justifyContent: "center",
  },

  hint: { flex: 1, fontSize: 14, color: palette.muted },

  mic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.dark,
  },
  micRecording: { backgroundColor: "#E5484D" },
  stopGlyph: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
});
