import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, View, TextInput, Pressable, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import Icon from "../ui/Icon";
import ReplyQuote from "./ReplyQuote";

const MIC_SPRING = { damping: 18, stiffness: 240, mass: 0.6 };
const CANCEL_DISTANCE = 48;

export default function MessageComposer({
  onSend,
  onAttachment,
  onCamera,
  onMicStart,
  onMicFinish,
  recording = false,
  recordingDuration = 0,
  onTyping,
  attachOpen = false,
  restoreKeyboard = false,
  onInputFocus,
  placeholder = "Message",
  replyTo = null,
  onCancelReply,
  focusRequest = 0,
}) {
  const [text, setText] = useState("");
  const [viewOnce, setViewOnce] = useState(false);
  const inputRef = useRef(null);
  const inputFocused = useRef(false);
  const wasAttachOpen = useRef(false);
  const micTranslationY = useSharedValue(0);
  const micArmed = useSharedValue(false);
  const micStarted = useSharedValue(false);
  const micFinished = useSharedValue(false);

  // The attachment panel takes the keyboard's place, which dismisses the
  // keyboard. When the panel closes again, hand focus back to the input so the
  // keyboard comes back — but only if it was open before the panel appeared.
  useEffect(() => {
    const closing = wasAttachOpen.current && !attachOpen;
    wasAttachOpen.current = attachOpen;
    if (!closing || inputFocused.current || !restoreKeyboard) return;
    // Focus right away so the keyboard's show animation runs at the same time
    // the panel slides down (the space swaps, nothing shifts).
    inputRef.current?.focus();
  }, [attachOpen, restoreKeyboard]);

  const handleChange = (v) => {
    setText(v);
    if (!v.trim()) setViewOnce(false);
    onTyping?.(v);
  };

  const wasRecording = useRef(false);
  useEffect(() => {
    if (recording) {
      wasRecording.current = true;
    } else if (wasRecording.current) {
      wasRecording.current = false;
      setViewOnce(false);
    }
  }, [recording]);

  useEffect(() => {
    if (focusRequest > 0) {
      const frame = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [focusRequest]);

  const handleSend = () => {
    const trimmed = text.trim();

    if (!trimmed) return;

    onSend?.(trimmed, { viewOnce });
    setText("");
    setViewOnce(false);
  };

  const hasText = text.trim().length > 0;
  const durationLabel = `${Math.floor(recordingDuration / 60)}:${String(
    Math.floor(recordingDuration % 60),
  ).padStart(2, "0")}`;

  const micGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin(() => {
          micStarted.value = false;
          micFinished.value = false;
          micTranslationY.value = 0;
          micArmed.value = false;
        })
        .onUpdate((event) => {
          micTranslationY.value = Math.max(-72, Math.min(8, event.translationY));
          micArmed.value = event.translationY <= -CANCEL_DISTANCE;
          if (micStarted.value || !micArmed.value) return;
          micStarted.value = true;
          micFinished.value = false;
          runOnJS(onMicStart)({ viewOnce });
        })
        .onEnd(() => {
          if (!micStarted.value || micFinished.value) return;
          micFinished.value = true;
          runOnJS(onMicFinish)({ canceled: false });
        })
        .onFinalize(() => {
          if (micStarted.value && !micFinished.value) {
            micFinished.value = true;
            runOnJS(onMicFinish)({ canceled: false });
          }
          micTranslationY.value = withSpring(0, MIC_SPRING);
          micArmed.value = false;
          micStarted.value = false;
        }),
    [micArmed, micFinished, micStarted, micTranslationY, onMicFinish, onMicStart, viewOnce],
  );

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: micTranslationY.value }],
    backgroundColor: micArmed.value
      ? "#E5484D"
      : recording
        ? "#FDECEC"
        : "#F2F2F2",
  }));

  const micIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micArmed.value ? 1.08 : 1 }],
  }));

  return (
    <View style={styles.shell}>
      {replyTo && (
        <View style={styles.replyBar}>
          <View style={styles.replyCopy}>
            <ReplyQuote replyTo={replyTo} />
          </View>
          <Pressable
            onPress={onCancelReply}
            hitSlop={8}
            style={styles.replyClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
          >
            <Icon name="close" size={18} color="#555555" />
          </Pressable>
        </View>
      )}
      {!recording && hasText ? (
        <Pressable
          onPress={() => setViewOnce((value) => !value)}
          style={[styles.viewOnceBar, viewOnce && styles.viewOnceBarActive]}
          accessibilityRole="button"
          accessibilityLabel={viewOnce ? "Disable view once" : "Enable view once"}
          accessibilityHint="Only the recipient can open this message once"
        >
          <View style={styles.viewOnceCopy}>
            <Icon name="viewOnce" size={17} color={viewOnce ? "#FFFFFF" : "#555555"} />
            <Text style={[styles.viewOnceLabel, viewOnce && styles.viewOnceLabelActive]}>
              View once
            </Text>
          </View>
        </Pressable>
      ) : null}
      <View style={styles.container}>
        <Pressable
          style={styles.iconButton}
          onPress={onAttachment}
          accessibilityRole="button"
          accessibilityLabel={attachOpen ? "Close attachments" : "Open attachments"}
        >
          <Icon
            name={attachOpen ? "keyboard" : "attachment"}
            size={22}
            color="#555555"
          />
        </Pressable>

        <View style={[styles.inputContainer, recording && styles.recordingContainer]}>
          {recording ? (
            <View style={styles.recordingRow}>
              <View style={styles.recDot} />
              <Icon name="microphone" size={18} color="#E5484D" />
              <Text style={styles.recordingDuration}>{durationLabel}</Text>
              <Text style={styles.recordingHint}>Release to send</Text>
            </View>
          ) : (
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={handleChange}
              onFocus={() => {
                inputFocused.current = true;
                // Tapping the field while the panel is open swaps back to
                // the keyboard.
                onInputFocus?.();
              }}
              onBlur={() => {
                inputFocused.current = false;
              }}
              placeholder={viewOnce ? "View-once message…" : placeholder}
              placeholderTextColor="#888888"
              style={styles.input}
              multiline
              maxLength={4000}
            />
          )}

          {!hasText && !recording && (
            <Pressable
              style={styles.inputAction}
              onPress={() => onCamera?.({ viewOnce })}
              accessibilityRole="button"
              accessibilityLabel={viewOnce ? "Take a view-once photo" : "Take a photo"}
            >
              <Icon name="camera" size={21} color="#555555" />
            </Pressable>
          )}
        </View>

        {hasText ? (
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Icon name="send" size={19} color="#FFFFFF" />
          </Pressable>
        ) : (
          <GestureDetector gesture={micGesture}>
            <Animated.View
              style={[styles.iconButton, styles.voiceButton, micStyle]}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Record voice note"
              accessibilityHint="Swipe up and release to record, or double tap to start and stop"
              onAccessibilityTap={() => {
                if (recording) onMicFinish?.({ canceled: false });
                else onMicStart?.({ viewOnce });
              }}
            >
              <Animated.View style={micIconStyle}>
                <Icon
                  name="soundWave"
                  size={22}
                  color={recording ? "#E5484D" : "#555555"}
                />
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: "#FFFFFF" },
  replyBar: {
    minHeight: 52,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F8",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
  },
  replyCopy: { flex: 1 },
  replyClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
  },

  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },

  micActive: {
    backgroundColor: "#FDECEC",
  },

  // The wave/mic button gets its own surface so it reads as a button
  // instead of a bare icon floating in the bar.
  voiceButton: {
    backgroundColor: "#F2F2F2",
  },

  inputContainer: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    paddingLeft: 13,
    paddingRight: 5,
    borderRadius: 21,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
  },

  recordingContainer: {
    backgroundColor: "#FDECEC",
  },

  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111111",
  },

  recordingRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },

  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E5484D",
  },

  viewOnceBar: {
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#F7F7F8",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
  },
  viewOnceBarActive: { backgroundColor: "#242424" },
  viewOnceCopy: { flexDirection: "row", alignItems: "center", gap: 7 },
  viewOnceLabel: { fontSize: 12, fontWeight: "600", color: "#555555" },
  viewOnceLabelActive: { color: "#FFFFFF" },

  recordingDuration: { fontSize: 13, fontWeight: "700", color: "#E5484D" },
  recordingHint: { marginLeft: "auto", fontSize: 11, color: "#A33A3E" },

  inputAction: {
    width: 36,
    height: 36,
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
});
