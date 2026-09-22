import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import palette from "../../constants/colors";

const GISTS = [
  { id: "1", name: "Design Crew", msg: "Adaeze: Final mock is ready", time: "2m", unread: 3 },
  { id: "2", name: "Kwame", msg: "You: sent a reel", time: "1h", unread: 0 },
  { id: "3", name: "Family Gist", msg: "Mum: Call when you land", time: "3h", unread: 1 },
];

export default function GistsScreen() {
  return (
    <PhoneScreen>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.sub}>Your gists live here</Text>
      <FlatList
        data={GISTS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 10, paddingTop: 14, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.msg} numberOfLines={1}>{item.msg}</Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unread}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </Pressable>
        )}
      />
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: palette.ink },
  sub: { fontSize: 14, color: palette.muted, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: palette.primary },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "700", color: palette.ink },
  time: { fontSize: 12, color: palette.muted },
  msg: { fontSize: 14, color: palette.muted, marginTop: 2 },
  unread: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
