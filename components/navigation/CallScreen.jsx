import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { BlurView } from "expo-blur";

import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import PhoneScreen from "../navigation/PhoneScreen";

export function formatCallDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * CallScreen — the chrome every call in the app sits inside.
 *
 * Blurred backdrop, back-and-more bar, the pulsing ring around whoever you are
 * talking to, their name, a status line, the clock, and the control deck. A
 * human voice call and a call with the assistant are the same screen with
 * different copy and different buttons, so the layout lives here rather than
 * being drawn twice.
 *
 * @param name        who is on the line
 * @param status      the line under the name — "Listening…", "Connected"
 * @param speaking    true while the far end is talking; speeds the pulse up
 * @param listening   true while this end is talking; tints the ring
 * @param avatar      avatar uri, or null to fall back to initials
 * @param controls    array of { id, icon, label, onPress, off, danger }
 * @param onBack      leave the call
 * @param title       bar title; defaults to "Voice Call"
 * @param children    anything to sit above the controls, e.g. a live caption
 */
export default function CallScreen({
  name,
  status,
  speaking = false,
  listening = false,
  avatar = null,
  controls = [],
  onBack,
  title = "Voice Call",
  children,
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // A ring that breathes while the line is quiet and beats faster while
    // someone is actually talking — the only cue there is that the call is live.
    const half = speaking || listening ? 380 : 620;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: half,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: half,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim, speaking, listening]);

  return (
    <PhoneScreen padded={false}>
      <View style={styles.screen}>
        <BlurView intensity={30} style={StyleSheet.absoluteFillObject} />

        <View style={styles.topBar}>
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
            <Icon name="back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.topBarTitle}>{title}</Text>
          {/* The slot is kept so the title stays centred. A real "more" menu
              belongs here later; an inert button would only invite a tap that
              does nothing, so nothing is drawn. */}
          <View style={styles.topBarSlot} />
        </View>

        <View style={styles.center}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View
              style={[
                styles.avatarRing,
                listening && styles.avatarRingListening,
                speaking && styles.avatarRingSpeaking,
              ]}
            >
              <Avatar uri={avatar} name={name ?? "?"} size={120} />
            </View>
          </Animated.View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>{status}</Text>
        </View>

        {children}

        <View style={styles.controls}>
          <View style={styles.row}>
            {controls.map((control) => (
              <Pressable
                key={control.id}
                style={({ pressed }) => [
                  styles.controlBtn,
                  control.danger && styles.endCall,
                  control.off && !control.danger && styles.controlOff,
                  pressed && styles.controlPressed,
                ]}
                onPress={control.onPress}
                accessibilityRole="button"
                accessibilityLabel={control.label}
              >
                <Icon name={control.icon} size={24} color="#FFFFFF" />
                <Text style={styles.controlLabel}>{control.label}</Text>
              </Pressable>
            ))}
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
  topBarSlot: { width: 22, height: 22 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRingListening: { backgroundColor: "rgba(229,72,77,0.28)" },
  avatarRingSpeaking: { backgroundColor: "rgba(91,87,255,0.32)" },
  name: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)" },

  controls: { paddingHorizontal: 24, paddingBottom: 40 },
  row: { flexDirection: "row", justifyContent: "center", gap: 24 },
  controlBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#3A3A3E",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  controlOff: { backgroundColor: "#8A8A8E" },
  endCall: { backgroundColor: "#E5484D", width: 80, height: 80, borderRadius: 40 },
  controlPressed: { opacity: 0.7 },
  controlLabel: { fontSize: 10, color: "#FFFFFF", fontWeight: "500" },
});
