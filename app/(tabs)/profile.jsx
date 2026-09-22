import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import Icon from "../../components/ui/Icon";
import { palette } from "../../constants/colors";

const STATS = [
  { v: "248", l: "Pings" },
  { v: "12.4k", l: "Followers" },
  { v: "890", l: "Following" },
];

export default function ProfileScreen() {
  return (
    <PhoneScreen>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>Y</Text>
        </View>
        <Text style={styles.name}>You</Text>
        <Text style={styles.handle}>@you · Lagos, Nigeria</Text>
        <View style={styles.stats}>
          {STATS.map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statV}>{s.v}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={styles.btnRow}>
          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryTxt}>Edit profile</Text>
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Icon name="settings" size={20} color={palette.ink} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Icon name="share" size={20} color={palette.ink} />
          </Pressable>
        </View>
      </View>
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "center", paddingTop: 12 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 36, fontWeight: "800", color: palette.primary },
  name: { fontSize: 22, fontWeight: "800", color: palette.ink, marginTop: 12 },
  handle: { fontSize: 14, color: palette.muted, marginTop: 2 },
  stats: { flexDirection: "row", gap: 28, marginTop: 16 },
  stat: { alignItems: "center" },
  statV: { fontSize: 17, fontWeight: "800", color: palette.ink },
  statL: { fontSize: 12, color: palette.muted, marginTop: 2 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
  primaryBtn: {
    flex: 1,
    backgroundColor: palette.dark,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
  iconBtn: {
    width: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    justifyContent: "center",
  },
});
