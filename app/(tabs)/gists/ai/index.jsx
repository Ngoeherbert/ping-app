import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Keyboard } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import Avatar from "../../../../components/ui/Avatar";
import Icon from "../../../../components/ui/Icon";
import MessageBubble from "../../../../components/messages/MessageBubble";
import AiVoiceBar from "../../../../components/messages/AiVoiceBar";
import TypingIndicator from "../../../../components/messages/TypingIndicator";
import useVoiceRecorder from "../../../../components/messages/useVoiceRecorder";
import { palette } from "../../../../constants/colors";

/**
 * AiChatScreen — a voice conversation, not a messenger.
 *
 * Same visual language as the thread (MessageBubble bubbles, the same header
 * shape, the same typing indicator) but deliberately none of its messaging
 * machinery: no text field, no view-once, no attachments, no emoji or games
 * panel, no call buttons and no swipe-to-reply. You tap, you talk, it answers.
 *
 * The transcript is rendered as voice notes rather than text because that is
 * what a voice session produces.
 */

let sequence = 0;
const nextId = () => `ai-${Date.now()}-${(sequence += 1)}`;

const AI_NAME = "Ping AI";
const AI_SENDER = { name: AI_NAME, avatar: null };

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Rotated in order so a conversation still reads as a back-and-forth. */
const REPLIES = [
  "Got it — I caught the gist of that. Want me to pull out the action items?",
  "That's clear. Here's how I'd break it into the next three steps.",
  "Noted. I can turn that into a short summary, or draft a reply you can send.",
  "Makes sense. Shall I keep the detail level like that, or trim it down?",
];

const OPENING = [
  {
    id: "ai-open-1",
    time: "9:41 AM",
    kind: "text",
    isMine: false,
    sender: AI_SENDER,
    text: `Hi — I'm ${AI_NAME}. This is a voice conversation, so just tap the mic and talk. Ask me for a summary, a draft, or the next step.`,
  },
];

export default function AiChatScreen() {
  const [messages, setMessages] = useState(OPENING);
  const [thinking, setThinking] = useState(false);

  const listRef = useRef(null);
  const replyTimerRef = useRef(null);
  const unmountedRef = useRef(false);
  const turnRef = useRef(0);

  // A pending answer must not land after the screen is gone.
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      clearTimeout(replyTimerRef.current);
    };
  }, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd?.({ animated: true }));
  }, []);

  const append = useCallback(
    (message) => {
      setMessages((current) => [...current, { id: nextId(), time: now(), ...message }]);
      scrollToEnd();
    },
    [scrollToEnd],
  );

  // Thinking first, answering a beat later — the same rhythm the thread uses.
  const scheduleReply = useCallback(() => {
    clearTimeout(replyTimerRef.current);
    setThinking(true);

    replyTimerRef.current = setTimeout(() => {
      if (unmountedRef.current) return;
      setThinking(false);
      const text = REPLIES[turnRef.current % REPLIES.length];
      turnRef.current += 1;
      append({ kind: "text", isMine: false, sender: AI_SENDER, text });
    }, 900);
  }, [append]);

  const {
    recording,
    durationMillis,
    start: startListening,
    stop: stopListening,
  } = useVoiceRecorder({
    onStart: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      Keyboard.dismiss();
    },
    // No preview step: in a voice session the finished take just goes out.
    onRecorded: ({ uri, duration }) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      append({ kind: "voice", isMine: true, status: "sent", uri, duration });
      scheduleReply();
    },
    onCanceled: () => {},
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      {/* Same header shape as the thread — back, avatar, name + presence. The
          call buttons are the one omission; an info button takes their place. */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Icon name="back" size={22} color={palette.ink} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chat info"
          onPress={() => router.push("/(tabs)/gists/ai/chat-info")}
          style={styles.headAvatar}
        >
          <Avatar uri={null} name="AI" size={40} />
        </Pressable>

        <View style={styles.headMid}>
          <Text style={styles.name} numberOfLines={1}>
            {AI_NAME}
          </Text>
          <Text style={styles.presence}>
            {recording ? "listening…" : thinking ? "typing…" : "Online"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chat info"
          onPress={() => router.push("/(tabs)/gists/ai/chat-info")}
          style={styles.back}
        >
          <Icon name="info" size={20} color={palette.ink} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
        renderItem={({ item }) => (
          <MessageBubble
            item={item}
            sender={item.isMine ? null : AI_SENDER}
            isGroup={false}
            showSenderHeader={false}
          />
        )}
        ListFooterComponent={
          thinking ? (
            <View style={styles.typingWrap}>
              <TypingIndicator />
            </View>
          ) : null
        }
      />

      <AiVoiceBar
        recording={recording}
        duration={durationMillis / 1000}
        hint={`Tap the mic to talk to ${AI_NAME}`}
        onStart={startListening}
        onStop={stopListening}
        onDiscard={() => stopListening({ canceled: true })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  back: { padding: 8 },
  headAvatar: { padding: 4 },
  headMid: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: "700", color: palette.ink },
  presence: { fontSize: 12, color: palette.muted, marginTop: 1 },

  thread: { paddingTop: 14, paddingBottom: 10 },
  typingWrap: { paddingHorizontal: 14, paddingVertical: 6 },
});

