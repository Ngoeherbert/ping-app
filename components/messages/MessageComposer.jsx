import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, View, TextInput, Pressable, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useAudioPlayer } from "expo-audio";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import Icon from "../ui/Icon";
import ReplyQuote from "./ReplyQuote";
import { formatDuration } from "./VoiceBubble";

const MIC_SPRING = { damping: 18, stiffness: 240, mass: 0.6 };
// How far up the finger has to travel mid-hold to lock the take hands-free.
const LOCK_DISTANCE = 48;
// How long the mic has to be held before it opens, so a quick tap or a flick
// on the way to the send button never starts a take.
const LONG_PRESS_MS = 260;

export default function MessageComposer({
  onSend,
  onPanelToggle,
  onEmojiPress,
  onCamera,
  onMicStart,
  onMicFinish,
  recording = false,
  recordingDuration = 0,
  // A finished take waiting for the user: nothing is sent until they tap send.
  voiceDraft = null,
  onVoiceDraftSend,
  onVoiceDraftDiscard,
  onVoiceDraftViewOnceChange,
  onTyping,
  panelOpen = false,
  // Id of the panel the modal is showing, so the buttons that opened it can
  // swap back to the keyboard while it is up.
  panel = null,
  restoreKeyboard = false,
  onInputFocus,
  placeholder = "Message",
  replyTo = null,
  onCancelReply,
  focusRequest = 0,
  ref,
}) {
  const [text, setText] = useState("");
  const [viewOnce, setViewOnce] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRef = useRef(null);
  const inputFocused = useRef(false);
  const wasPanelOpen = useRef(false);
  const micTranslationY = useSharedValue(0);
  // Set when the finger slides up mid-hold: the take goes hands-free and keeps
  // running after the finger lifts.
  const micLocked = useSharedValue(false);
  const micStarted = useSharedValue(false);
  // A hands-free take the finger has already left.
  const [recordingLocked, setRecordingLocked] = useState(false);
  // The hold timer runs on the JS side (it owns a setTimeout), so the gesture
  // worklet just hops over to start and stop it.
  const holdTimerRef = useRef(null);
  const holdActiveRef = useRef(false);

  // The take being previewed before it is sent, if any.
  const player = useAudioPlayer(voiceDraft?.uri ? { uri: voiceDraft.uri } : null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  // The beat between lifting your finger and the route handing the finished take
  // back. Without it the composer would flash the empty input and the mic button
  // for a frame before the send button appears.
  const [pendingTake, setPendingTake] = useState(false);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  // Load the finished take into the player. When the draft goes away the player
  // is only paused and rewound, never `remove()`d — that tears down the native
  // player for good, and the next take would have nothing to load into.
  useEffect(() => {
    if (!voiceDraft) {
      setPreviewPlaying(false);
      try {
        player.pause();
        player.seekTo(0).catch(() => {});
      } catch {
        // Nothing was loaded, or the source is already gone.
      }
      return;
    }

    try {
      player.replace({ uri: voiceDraft.uri });
    } catch {
      setPreviewPlaying(false);
    }
  }, [player, voiceDraft]);

  // Mirror the player's own state so the button flips back when a take ends.
  useEffect(() => {
    const sub = player.addListener?.("playbackStatusUpdate", (status) => {
      setPreviewPlaying(Boolean(status?.playing));
      if (status?.didJustFinish) {
        setPreviewPlaying(false);
        player.seekTo(0).catch(() => {});
      }
    });
    return () => sub?.remove?.();
  }, [player]);

  // Silence the player before the screen deletes the file, so the take is never
  // removed from under its own source.
  const discardPreview = useCallback(() => {
    try {
      player.pause();
      player.seekTo(0).catch(() => {});
    } catch {
      // Already stopped.
    }
    setPreviewPlaying(false);
    onVoiceDraftDiscard?.();
  }, [onVoiceDraftDiscard, player]);

  const togglePreviewPlayback = useCallback(() => {
    try {
      if (previewPlaying) {
        player.pause();
        setPreviewPlaying(false);
      } else {
        player.seekTo(0);
        player.play();
        setPreviewPlaying(true);
      }
    } catch {
      setPreviewPlaying(false);
    }
  }, [player, previewPlaying]);

  // The composer panel takes the keyboard's place, which dismisses the
  // keyboard. When the panel closes again, hand focus back to the input so the
  // keyboard comes back — but only if it was open before the panel appeared.
  useEffect(() => {
    const closing = wasPanelOpen.current && !panelOpen;
    wasPanelOpen.current = panelOpen;
    if (!closing || inputFocused.current || !restoreKeyboard) return;
    // Focus right away so the keyboard's show animation runs at the same time
    // the panel slides down (the space swaps, nothing shifts).
    inputRef.current?.focus();
  }, [panelOpen, restoreKeyboard]);

  // Lets the screen insert emoji picked from the panel without lifting the
  // composer's text state up into the route.
  useImperativeHandle(
    ref,
    () => ({
      insertEmoji(char) {
        if (!char) return;
        setText((current) => {
          const caret = Math.max(0, Math.min(selection.end, current.length));
          const next = current.slice(0, caret) + char + current.slice(caret);
          onTyping?.(next);
          return next;
        });
        // No focus() call on purpose: focusing would summon the keyboard and
        // close the panel the emoji was picked from.
      },
      focus() {
        inputRef.current?.focus();
      },
    }),
    [onTyping, selection.end],
  );

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
  // "emojis" mirrors PANEL_IDS.emojis — the panel id, without importing the
  // modal into the composer just to read a constant.
  const emojiOpen = panelOpen && panel === "emojis";
  // While a take is pending, the flag lives on the draft rather than on the
  // input — recording clears the local one, but the note is not sent yet and the
  // control has to keep showing the truth until it is sent or thrown away.
  const viewOnceArmed = voiceDraft ? voiceDraft.viewOnce === true : viewOnce;

  const toggleViewOnce = useCallback(() => {
    if (voiceDraft) {
      onVoiceDraftViewOnceChange?.(!voiceDraft.viewOnce);
      return;
    }
    setViewOnce((value) => !value);
  }, [onVoiceDraftViewOnceChange, voiceDraft]);
  const durationLabel = `${Math.floor(recordingDuration / 60)}:${String(
    Math.floor(recordingDuration % 60),
  ).padStart(2, "0")}`;

  // Stopping a take — from releasing the mic or from the stop button. The row
  // holds its shape while the recorder finalises the file behind it.
  const stopTake = useCallback(() => {
    setPendingTake(true);
    onMicFinish?.({ canceled: false, viewOnce });
  }, [onMicFinish, viewOnce]);

  // Once the take lands — or a new one starts — the handover is over.
  useEffect(() => {
    if (voiceDraft || recording) setPendingTake(false);
  }, [recording, voiceDraft]);

  // Pressing the mic does nothing until the hold completes, so a stray tap never
  // opens a take. Releasing stops the recorder and parks the result in the
  // preview bar — it never sends.
  const beginHold = useCallback(() => {
    if (holdActiveRef.current) return;
    holdActiveRef.current = true;
    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      micStarted.value = true;
      onMicStart?.({ viewOnce });
    }, LONG_PRESS_MS);
  }, [clearHoldTimer, micStarted, onMicStart, viewOnce]);

  // Releasing does two different things depending on how the take was started.
  // A plain long press stops the recorder, so the take lands in the preview bar
  // for review. Sliding up first locks it hands-free instead, and it keeps
  // running until the user stops it on purpose.
  //
  // `locked` arrives as an argument rather than being read off the shared value
  // here: the worklet has already moved on by the time this runs, and a plain
  // read would see a flag that was reset for the next gesture.
  const endHold = useCallback((locked) => {
    // onEnd and onFinalize both fire on release, so this has to be idempotent.
    if (!holdActiveRef.current) return;
    holdActiveRef.current = false;
    clearHoldTimer();

    if (!micStarted.value) return;
    micStarted.value = false;

    if (locked) {
      setRecordingLocked(true);
      return;
    }

    // Finger up: stop straight away, and the send button takes the mic's place
    // for as long as the take is waiting to go out.
    stopTake();
  }, [clearHoldTimer, micStarted, stopTake]);

  // Drop a pending hold if the composer goes away mid-press.
  useEffect(() => clearHoldTimer, [clearHoldTimer]);

  // Whatever stopped the take — long press, stop button or discard — hands the
  // hands-free flag back so the next hold starts fresh, and un-reddens the mic
  // (its red state is driven by the same shared value the gesture reads).
  useEffect(() => {
    if (recording) return;
    setRecordingLocked(false);
    micLocked.value = false;
  }, [micLocked, recording]);

  const micGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin(() => {
          // Every gesture starts from a clean slate, which is why nothing else
          // has to reset these flags.
          micStarted.value = false;
          micTranslationY.value = 0;
          micLocked.value = false;
          runOnJS(beginHold)();
        })
        .onUpdate((event) => {
          // Nothing moves until the hold has actually opened the recorder.
          if (!micStarted.value) return;
          micTranslationY.value = Math.max(-72, Math.min(8, event.translationY));
          micLocked.value = event.translationY <= -LOCK_DISTANCE;
        })
        .onEnd(() => {
          runOnJS(endHold)(micLocked.value);
        })
        .onFinalize(() => {
          // Only springs the button home — it deliberately leaves the lock flag
          // alone so a cancelled gesture still reports how it ended. endHold is
          // idempotent, so this is a no-op whenever onEnd already ran.
          runOnJS(endHold)(micLocked.value);
          micTranslationY.value = withSpring(0, MIC_SPRING);
        }),
    [beginHold, endHold, micLocked, micStarted, micTranslationY],
  );

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: micTranslationY.value }],
    // Red once the take is locked: the release will no longer stop it.
    backgroundColor: micLocked.value
      ? "#E5484D"
      : recording
        ? "#FDECEC"
        : "#F2F2F2",
  }));

  const micIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micLocked.value ? 1.08 : 1 }],
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
      <View style={styles.container}>
        {/* One button, two jobs. The composer is either composing something — a
            message, a take, or a finished take waiting to be sent — and then the
            slot turns into the view-once toggle. Only an idle, empty composer
            gives up the attachment panel. A pending voice note keeps the
            view-once control on screen until it is sent or thrown away. */}
        {hasText || recording || voiceDraft || pendingTake ? (
          <Pressable
            style={[styles.iconButton, viewOnceArmed && styles.viewOnceButtonActive]}
            onPress={toggleViewOnce}
            accessibilityRole="button"
            accessibilityState={{ selected: viewOnceArmed }}
            accessibilityLabel={viewOnceArmed ? "Disable view once" : "Enable view once"}
            accessibilityHint="Only the recipient can open this message once"
          >
            <Icon
              name="viewOnce"
              size={22}
              color={viewOnceArmed ? "#FFFFFF" : "#555555"}
            />
          </Pressable>
        ) : (
          <Pressable
            style={styles.iconButton}
            onPress={onPanelToggle}
            accessibilityRole="button"
            accessibilityLabel={panelOpen ? "Close panel" : "Open panel"}
            accessibilityHint={
              panelOpen ? "Bring the keyboard back" : "Photos, video, files and games"
            }
          >
            <Icon
              name={panelOpen ? "keyboard" : "attachment"}
              size={22}
              color="#555555"
            />
          </Pressable>
        )}

        <View style={[styles.inputContainer, recording && styles.recordingContainer]}>
          {voiceDraft || pendingTake ? (
            /* The finished take, or the beat between the finger lifting and the
               route handing it over — the row keeps its shape either way, so the
               send button below never blinks back into a mic. */
            <View style={styles.previewRow}>
              {voiceDraft ? (
                <Pressable
                  onPress={togglePreviewPlayback}
                  style={styles.previewPlay}
                  accessibilityRole="button"
                  accessibilityLabel={previewPlaying ? "Pause voice note" : "Play voice note"}
                >
                  <Icon
                    name={previewPlaying ? "pause" : "play"}
                    size={15}
                    color="#111111"
                  />
                </Pressable>
              ) : (
                <View style={[styles.previewPlay, styles.previewPlayPending]}>
                  <Icon name="soundWave" size={15} color="#8A8A8A" />
                </View>
              )}

              <Text
                style={[styles.previewDuration, !voiceDraft && styles.previewMuted]}
              >
                {voiceDraft ? formatDuration(voiceDraft.duration) : "0:00"}
              </Text>
              <Text numberOfLines={1} style={styles.previewHint}>
                {voiceDraft ? "Voice note ready" : "Preparing voice note…"}
              </Text>

              {voiceDraft && (
                <Pressable
                  onPress={discardPreview}
                  style={styles.previewDelete}
                  accessibilityRole="button"
                  accessibilityLabel="Discard voice note"
                >
                  <Icon name="delete" size={19} color="#777777" />
                </Pressable>
              )}
            </View>
          ) : recording ? (
            <View style={styles.recordingRow}>
              <View style={styles.recDot} />
              <Icon name="microphone" size={18} color="#E5484D" />
              <Text style={styles.recordingDuration}>{durationLabel}</Text>
              <Text style={styles.recordingHint}>
                {recordingLocked ? "Tap stop when you're done" : "Release to review"}
              </Text>

              {/* Only a locked take outlives the finger, so only then does it
                  need a way to be stopped or thrown away. */}
              {recordingLocked && (
                <Pressable
                  onPress={() => onMicFinish?.({ canceled: true })}
                  style={styles.recordingDelete}
                  accessibilityRole="button"
                  accessibilityLabel="Discard recording"
                >
                  <Icon name="delete" size={18} color="#A33A3E" />
                </Pressable>
              )}
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
              onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
              placeholder={viewOnce ? "View-once message…" : placeholder}
              placeholderTextColor="#888888"
              style={styles.input}
              multiline
              maxLength={4000}
            />
          )}

          {!hasText && !recording && !voiceDraft && !pendingTake && (
            <Pressable
              style={styles.inputAction}
              onPress={() => onCamera?.({ viewOnce })}
              accessibilityRole="button"
              accessibilityLabel={viewOnce ? "Take a view-once photo" : "Take a photo"}
            >
              <Icon name="camera" size={21} color="#555555" />
            </Pressable>
          )}

          {/* The emoji panel is the keyboard's other half, so its button lives
              in the input and stays put whether or not there is text. */}
          {!recording && !voiceDraft && !pendingTake && (
            <Pressable
              style={styles.inputAction}
              onPress={onEmojiPress}
              accessibilityRole="button"
              accessibilityLabel={emojiOpen ? "Close emoji" : "Open emoji"}
              accessibilityHint={
                emojiOpen ? "Bring the keyboard back" : "Insert an emoji into your message"
              }
            >
              <Icon
                name={"emoji"}
                size={21}
                color="#555555"
              />
            </Pressable>
          )}
        </View>

        {voiceDraft || pendingTake ? (
          /* The send the user has to mean: nothing goes out until this tap. */
          <Pressable
            style={styles.sendButton}
            onPress={onVoiceDraftSend}
            accessibilityRole="button"
            accessibilityLabel="Send voice note"
          >
            <Icon name="send" size={19} color="#FFFFFF" />
          </Pressable>
        ) : hasText ? (
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Icon name="send" size={19} color="#FFFFFF" />
          </Pressable>
        ) : recordingLocked ? (
          /* The finger is off the mic but the take is still running: the only
             way out is a deliberate stop. */
          <Pressable
            style={styles.sendButton}
            onPress={stopTake}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
          >
            <View style={styles.stopGlyph} />
          </Pressable>
        ) : (
          <GestureDetector gesture={micGesture}>
            <Animated.View
              style={[styles.iconButton, styles.voiceButton, micStyle]}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Record voice note"
              accessibilityHint="Hold to record and release to review, or slide up to keep recording hands-free"
              onAccessibilityTap={() => {
                // Screen readers have no hold gesture, so tap toggles instead.
                if (recording) stopTake();
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

  // Armed view-once reads as a filled state, the same inversion the old bar used.
  viewOnceButtonActive: { backgroundColor: "#242424" },

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
    paddingVertical: 14,
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

  // A finished take sitting in the composer, before anyone has sent it.
  previewRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },

  previewPlay: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E2E6",
  },

  // While the recorder is still finalising the file there is nothing to play.
  previewPlayPending: { backgroundColor: "#EDEDF0" },
  previewMuted: { color: "#8A8A8A" },

  previewDuration: { fontSize: 13, fontWeight: "700", color: "#111111" },
  previewHint: { flexShrink: 1, fontSize: 12, color: "#777777" },

  previewDelete: {
    marginLeft: "auto",
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingDuration: { fontSize: 13, fontWeight: "700", color: "#E5484D" },
  recordingHint: { marginLeft: "auto", fontSize: 11, color: "#A33A3E" },

  recordingDelete: {
    marginLeft: 6,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  // A filled square reads as "stop" without needing another icon in the set.
  stopGlyph: {
    width: 13,
    height: 13,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
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
