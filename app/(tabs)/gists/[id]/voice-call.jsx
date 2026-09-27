import React, { useState, useEffect, useMemo } from "react";
import { Text, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import CallScreen, { formatCallDuration } from "../../../../components/navigation/CallScreen";
import { getConversation } from "../../../../lib/gists";

export default function VoiceCallScreen() {
  const { id } = useLocalSearchParams();
  const conversation = getConversation(id);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const endCall = () => {
    router.back();
  };

  // The clock sits under the status line, so it rides along as a child of the
  // shared chrome rather than being drawn by it.
  const clock = (
    <Text style={styles.duration}>{formatCallDuration(duration)}</Text>
  );

  const controls = useMemo(
    () => [
      {
        id: "mute",
        icon: muted ? "micOff" : "microphone",
        label: muted ? "Unmute" : "Mute",
        onPress: () => setMuted((m) => !m),
        off: muted,
      },
      {
        id: "end",
        icon: "callEnd",
        label: "End",
        onPress: endCall,
        danger: true,
      },
    ],
    [muted],
  );

  return (
    <CallScreen
      name={conversation?.name ?? "Unknown"}
      status="Voice Call"
      avatar={conversation?.avatar}
      onBack={endCall}
      controls={controls}
    >
      {clock}
    </CallScreen>
  );
}

const styles = StyleSheet.create({
  duration: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
    marginTop: -6,
  },
});

