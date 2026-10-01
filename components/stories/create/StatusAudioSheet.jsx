import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Icon from "../../ui/Icon";
import CustomModalSheet from "../../ui/CustomModalSheet";
import VoiceBubble from "../../messages/VoiceBubble";
import useVoiceRecorder from "../../messages/useVoiceRecorder";
import { fmtDur } from "./constants";

const StatusAudioSheet = forwardRef(function StatusAudioSheet({ onDone }, ref) {
  const inner = useRef(null);
  const [take, setTake] = useState(null);
  const takeRef = useRef(null);
  takeRef.current = take;

  useImperativeHandle(ref, () => ({
    open: () => inner.current?.open(),
    close: (after) => inner.current?.close(after),
  }));

  const recorder = useVoiceRecorder({
    onRecorded: (t) => {
      setTake({ uri: t.uri, duration: t.duration ?? 0 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
  });

  const toggle = useCallback(() => {
    if (recorder.recording) recorder.stop();
    else {
      setTake(null);
      recorder.start();
    }
  }, [recorder]);

  const useIt = useCallback(() => {
    const t = takeRef.current;
    if (!t) return;
    onDone?.(t);
    setTake(null);
    inner.current?.close();
  }, [onDone]);

  return (
    <CustomModalSheet
      ref={inner}
      title="Voice status"
      showCloseButton
      footer={
        take && !recorder.recording ? (
          <Pressable onPress={useIt} style={s.go} accessibilityRole="button" accessibilityLabel="Use recording">
            <Text style={s.goText}>Use recording</Text>
          </Pressable>
        ) : null
      }
    >
      <View style={{ paddingBottom: 24, gap: 14 }}>
        <View style={s.recRow}>
          <Pressable
            onPress={toggle}
            style={[s.recBtn, recorder.recording && s.recBtnOn]}
            accessibilityRole="button"
            accessibilityLabel={recorder.recording ? "Stop recording" : "Start recording"}
          >
            <Icon name={recorder.recording ? "pause" : "mic"} size={26} color="#FFFFFF" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.recTitle}>{recorder.recording ? "Recording..." : take ? "Preview" : "Tap to record"}</Text>
            <Text style={s.recSub}>
              {recorder.recording ? fmtDur(recorder.durationMillis / 1000) : take ? fmtDur(take.duration) : "Up to 60 seconds"}
            </Text>
          </View>
        </View>
        {take && !recorder.recording && (
          <View style={s.prev}>
            <VoiceBubble uri={take.uri} duration={take.duration} time="now" />
          </View>
        )}
      </View>
    </CustomModalSheet>
  );
});

export default StatusAudioSheet;

const s = StyleSheet.create({
  recRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  recBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#00A884", alignItems: "center", justifyContent: "center" },
  recBtnOn: { backgroundColor: "#E5484D" },
  recTitle: { fontSize: 15, fontWeight: "800", color: "#0F1419" },
  recSub: { fontSize: 13, color: "#687076", marginTop: 2, fontVariant: ["tabular-nums"] },
  prev: { borderRadius: 14, backgroundColor: "#F6F6F8", padding: 12 },
  go: { marginHorizontal: 16, marginBottom: 16, borderRadius: 999, backgroundColor: "#00A884", paddingVertical: 13, alignItems: "center" },
  goText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
