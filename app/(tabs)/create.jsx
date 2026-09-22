import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import Icon from "../../components/ui/Icon";
import { palette } from "../../constants/colors";

const OPTIONS = [
  { icon: "edit", label: "New Ping", hint: "Share a thought" },
  { icon: "video", label: "New Reel", hint: "Record or upload" },
  { icon: "messages", label: "New Gist", hint: "Message friends" },
];

export default function CreateScreen() {
  return (
    <PhoneScreen>
      <Text style={styles.title}>Create</Text>
      <Text style={styles.sub}>What do you want to share?</Text>
      <View style={{ gap: 12, marginTop: 16 }}>
        {OPTIONS.map((o) => (
          <Pressable
            key={o.label}
            style={({ pressed }) => [styles.opt, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <View style={styles.optIcon}>
              <Icon name={o.icon} size={22} color={palette.primary} />
            </View>
            <View>
              <Text style={styles.optLabel}>{o.label}</Text>
              <Text style={styles.optHint}>{o.hint}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: palette.ink },
  sub: { fontSize: 14, color: palette.muted, marginTop: 2 },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
  },
  optIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  optLabel: { fontSize: 16, fontWeight: "700", color: palette.ink },
  optHint: { fontSize: 13, color: palette.muted, marginTop: 2 },
});
