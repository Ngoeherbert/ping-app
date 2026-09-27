import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as Speech from "expo-speech";

import CallScreen, { formatCallDuration } from "../../../../components/navigation/CallScreen";
import useChatComposer from "../../../../components/messages/useChatComposer";
import {
  AI_CONVERSATION,
  AI_NAME,
  aiOpening,
  useAiResponder,
  useHandsFreeCall,
} from "../../../../lib/ai";

/**
 * AiVoiceScreen — a call with the assistant, hands free.
 *
 * Two-way audio, laid out like any other call in the app: the same blurred
 * backdrop, pulsing ring, status line, clock and control deck as a human voice
 * call, because it *is* one from the user's side. You talk, it answers out loud.
 *
 * There is no talk button. The microphone is the user's turn for as long as the
 * call is up, and `useHandsFreeCall` decides when a turn is over by watching the
 * recorder's level: say "hey", stop, and the answer comes back on its own. The
 * floor alternates strictly — the mic shuts the moment your take is sent and
 * reopens when the assistant finishes — so the call never records its own voice.
 *
 * The rest is borrowed, not rebuilt. The recorder is the one MessageComposer
 * uses, `useChatComposer({ voiceMode: true })` is what sends a take instead of
 * parking it in a preview bar, and `useAiResponder` sets the reply timing the
 * same way it does in the text chat. `Speech` is what makes it a call rather
 * than a chat: every answer is read aloud as it is delivered.
 *
 * The transcript is a caption, not the interface — the last thing the assistant
 * said stays on screen, so a muted or unheard answer is still readable.
 */
export default function AiVoiceScreen() {
  const listRef = useRef(null);

  const [duration, setDuration] = useState(0);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  // True while an answer is on its way but has not started talking yet. The
  // mic stays shut for this stretch too, or the reply would land mid-thought.
  const [waiting, setWaiting] = useState(false);

  // Read through a ref, not through state: the speak callback has to stay
  // referentially stable or every mute toggle would rebuild the responder and
  // restart an answer already in flight.
  const speakerOffRef = useRef(false);
  speakerOffRef.current = speakerOff;

  const chat = useChatComposer({
    conversation: AI_CONVERSATION,
    listRef,
    initialMessages: aiOpening(
      `Hi — this is a call. Just talk; I'll answer out loud.`,
    ),
    voiceMode: true,
    onVoiceSent: () => setWaiting(true),
  });
  const {
    messages,
    receive,
    typing,
    setTyping,
    beginTyping,
    recording,
    getMetering,
    startVoiceRecording,
    stopVoiceRecording,
  } = chat;

  // A call is up as long as the screen is up, so the clock runs from mount.
  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Never leave the assistant talking to an empty room.
  useEffect(() => {
    return () => {
      Speech.stop().catch(() => {});
    };
  }, []);

  const speak = useCallback((text) => {
    if (speakerOffRef.current) {
      // Muted: the answer is still in the transcript, and the caption shows it.
      setWaiting(false);
      return;
    }
    Speech.stop().catch(() => {});
    Speech.speak(text, {
      language: "en-US",
      rate: 1.0,
      pitch: 1.0,
      onStart: () => {
        setWaiting(false);
        setSpeaking(true);
      },
      // The mic reopens the moment it stops talking, so the reply is answered
      // in the same breath rather than after a pause.
      onDone: () => {
        setSpeaking(false);
      },
      onStopped: () => {
        setSpeaking(false);
      },
      onError: () => {
        setSpeaking(false);
      },
    });
  }, []);

  const scheduleReply = useAiResponder({
    receive,
    setTyping,
    beginTyping,
    onDeliver: speak,
  });

  // The loop itself: it opens the mic when it is your turn and closes it on a
  // trailing silence, so a turn ends because you finished, not because you
  // pressed something.
  useHandsFreeCall({
    enabled: !muted,
    getMetering,
    recording,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    onTurnEnd: scheduleReply,
    speaking,
    waiting,
  });

  // Suspending means closing the mic for good, and dropping whatever the loop
  // had open. Unmuting lets the loop reopen it.
  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      if (next) {
        Speech.stop().catch(() => {});
        setSpeaking(false);
        setWaiting(false);
        stopVoiceRecording({ canceled: true });
      }
      return next;
    });
  }, [stopVoiceRecording]);

  const toggleSpeaker = useCallback(() => {
    setSpeakerOff((off) => {
      if (off) return false;
      Speech.stop().catch(() => {});
      setSpeaking(false);
      return true;
    });
  }, []);

  const endCall = useCallback(() => {
    Speech.stop().catch(() => {});
    setSpeaking(false);
    setWaiting(false);
    stopVoiceRecording({ canceled: true });
    router.back();
  }, [stopVoiceRecording]);

  // Whichever end of the call has the floor, the status line says so. One
  // source of truth, so the ring, the pulse and the words can never disagree.
  const status = muted
    ? "Muted"
    : speaking
      ? "Speaking…"
      : waiting
        ? "Thinking…"
        : recording
          ? "Listening…"
          : typing
            ? "Thinking…"
            : "Connecting…";

  // The caption is the assistant's last answer. It is what makes the call
  // legible when the speaker is off, or when an answer went past unheard.
  const lastReply = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.isMine) continue;
      const text = String(message?.text ?? message?.caption ?? "").trim();
      if (text) return text;
    }
    return null;
  }, [messages]);

  // There is no talk button: the mic is the user's turn for as long as the call
  // is up. What the deck still offers is the two things a call always has —
  // hold the floor, and hang up — plus the speaker.
  const controls = useMemo(
    () => [
      {
        id: "mic",
        icon: muted ? "micOff" : "microphone",
        label: muted ? "Unmute" : "Mute",
        onPress: toggleMute,
        off: muted,
      },
      {
        id: "speaker",
        icon: speakerOff ? "mute" : "volume",
        label: speakerOff ? "Unmute" : "Speaker",
        onPress: toggleSpeaker,
        off: speakerOff,
      },
      {
        id: "end",
        icon: "callEnd",
        label: "End",
        onPress: endCall,
        danger: true,
      },
    ],
    [muted, speakerOff, toggleMute, toggleSpeaker, endCall],
  );

  return (
    <CallScreen
      name={AI_NAME}
      status={status}
      listening={recording && !muted}
      speaking={speaking}
      onBack={endCall}
      title="Voice Call"
      controls={controls}
    >
      <View style={styles.captionWrap}>
        <Text style={styles.duration}>{formatCallDuration(duration)}</Text>
        {lastReply ? (
          <View style={styles.caption}>
            <Text style={styles.captionText} numberOfLines={3}>
              {lastReply}
            </Text>
          </View>
        ) : null}
      </View>
    </CallScreen>
  );
}

const styles = StyleSheet.create({
  captionWrap: { paddingHorizontal: 24, paddingBottom: 8, gap: 14 },

  duration: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },

  caption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  captionText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#FFFFFF",
    textAlign: "center",
  },
});

