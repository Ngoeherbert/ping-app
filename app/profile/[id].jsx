import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Avatar from "../../components/ui/Avatar";
import Icon from "../../components/ui/Icon";
import VerifiedBadge from "../../components/ui/VerifiedBadge";
import { palette } from "../../constants/colors";
import { getProfileById } from "../../lib/mockData";
import PhoneScreen from "../../components/navigation/PhoneScreen";

const STATS = [
  { v: "248", l: "Pings" },
  { v: "12.4k", l: "Followers" },
  { v: "890", l: "Following" },
];

export default function ProfileIdScreen() {
  const { id } = useLocalSearchParams();
  const profile = getProfileById(id);

  const name = profile?.name ?? "Unknown";
  const handle = profile?.handle ?? `@${name.toLowerCase().replace(/ /g, "")}`;
  const avatar = profile?.avatar ?? undefined;
  const verified = profile?.verified ?? false;
  const verifiedVariant = profile?.verifiedVariant ?? "blue";
  const location = profile?.location ?? null;

  return (
    <PhoneScreen>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Avatar uri={avatar} name={name} size={92} />
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          {verified && <VerifiedBadge variant={verifiedVariant} size={20} />}
        </View>
        <Text style={styles.handle}>
          {handle}
          {location && (
            <>
              {" · "}
              <Text style={styles.location}>{location}</Text>
            </>
          )}
        </Text>
        <View style={styles.stats}>
          {STATS.map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statV}>{s.v}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={styles.btnRow}>
          <Pressable style={styles.primaryBtn} accessibilityRole="button">
            <Text style={styles.primaryTxt}>Message</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} accessibilityRole="button">
            <Icon name="settings" size={20} color={palette.ink} />
          </Pressable>
          <Pressable style={styles.iconBtn} accessibilityRole="button">
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  name: { fontSize: 22, fontWeight: "800", color: palette.ink },
  handle: { fontSize: 14, color: palette.muted, marginTop: 2 },
  location: { color: palette.ink, opacity: 0.7 },
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
