import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { CameraView } from "expo-camera";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { getConversation } from "../../../../lib/gists";
import PhoneScreen from "../../../../components/navigation/PhoneScreen";

function formatDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function VideoCallScreen() {
  const { id } = useLocalSearchParams();
  const conversation = getConversation(id);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [facing, setFacing] = useState("back");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const toggleCamera = () => setFacing((f) => (f === "back" ? "front" : "back"));
  const toggleCameraOff = () => setCameraOff((c) => !c);
  const toggleMute = () => setMuted((m) => !m);
  const endCall = () => router.back();

  return (
    <PhoneScreen padded={false}>
      <View style={styles.screen}>
        <BlurView intensity={30} style={StyleSheet.absoluteFillObject} />

        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          muted={muted || cameraOff}
          paused={false}
        />

        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Icon name="back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.topBarTitle}>Video Call</Text>
          <Pressable>
            <Icon name="more" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.center}>
          <Animated.View style={[styles.avatarWrap, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatarRing}>
              <Avatar
                uri={conversation?.avatar}
                name={conversation?.name ?? "?"}
                size={120}
              />
            </View>
          </Animated.View>
          <Text style={styles.name}>
            {conversation?.name ?? "Unknown"}
          </Text>
          <Text style={styles.subtitle}>Video Call</Text>
          <Text style={styles.duration}>{formatDuration(duration)}</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.row}>
            <Pressable
              style={[styles.controlBtn, muted && styles.controlOff]}
              onPress={toggleMute}
              accessibilityRole="button"
              accessibilityLabel={muted ? "Unmute" : "Mute"}
            >
              <Icon
                name={muted ? "micOff" : "microphone"}
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.controlLabel}>
                {muted ? "Unmute" : "Mute"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.controlBtn, cameraOff && styles.controlOff]}
              onPress={toggleCameraOff}
              accessibilityRole="button"
              accessibilityLabel={cameraOff ? "Turn on camera" : "Turn off camera"}
            >
              <Icon
                name={cameraOff ? "camera" : "cameraOff"}
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.controlLabel}>
                {cameraOff ? "Camera" : "Camera"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.controlBtn]}
              onPress={toggleCamera}
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
            >
              <Icon name="switchCamera" size={24} color="#FFFFFF" />
              <Text style={styles.controlLabel}>Flip</Text>
            </Pressable>

            <Pressable
              style={[styles.controlBtn, styles.endCall]}
              onPress={endCall}
              accessibilityRole="button"
              accessibilityLabel="End call"
            >
              <Icon name="callEnd" size={24} color="#FFFFFF" />
              <Text style={styles.controlLabel}>End</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarTitle: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  avatarWrap: { alignItems: "center" },
  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  duration: { fontSize: 13, color: "rgba(255,255,255,0.6)", fontVariant: ["tabular-nums"] },
  controls: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { flexDirection: "row", justifyContent: "center", gap: 16 },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3A3A3E",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  controlOff: { backgroundColor: "#E5484D" },
  endCall: { backgroundColor: "#E5484D", width: 68, height: 68 },
  controlLabel: { fontSize: 9, color: "#FFFFFF", fontWeight: "500" },
});
