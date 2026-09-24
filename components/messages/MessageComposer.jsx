import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";

import Icon from "../ui/Icon";
import ReplyQuote from "./ReplyQuote";

export default function MessageComposer({
  onSend,
  onAttachment,
  onCamera,
  onMicPress,
  onMicRelease,
  recording = false,
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
  const inputRef = useRef(null);
  const inputFocused = useRef(false);
  const wasAttachOpen = useRef(false);

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
    onTyping?.(v);
  };

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

    onSend?.(trimmed);
    setText("");
  };

  const hasText = text.trim().length > 0;

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
            placeholder={placeholder}
            placeholderTextColor="#888888"
            style={styles.input}
            multiline
            maxLength={4000}
          />
        )}

        {!hasText && !recording && (
          <Pressable style={styles.inputAction} onPress={onCamera}>
            <Icon name="camera" size={21} color="#555555" />
          </Pressable>
        )}
      </View>

      {hasText ? (
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Icon name="send" size={19} color="#FFFFFF" />
        </Pressable>
      ) : (
        <Pressable
          style={[
            styles.iconButton,
            styles.voiceButton,
            recording && styles.micActive,
          ]}
          onPressIn={onMicPress}
          onPressOut={onMicRelease}
          delayLongPress={250}
          accessibilityRole="button"
          accessibilityLabel="Hold to record a voice note"
        >
          <Icon
            name="soundWave"
            size={22}
            color={recording ? "#E5484D" : "#555555"}
          />
        </Pressable>
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
