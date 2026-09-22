import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import Icon from "../../components/ui/Icon";
import palette from "../../constants/colors";

const PINGS = [
  { id: "1", user: "Adaeze O.", time: "2m", text: "Who's at the beach house this weekend? Bringing snacks.", likes: 24, replies: 8 },
  { id: "2", user: "Kwame M.", time: "18m", text: "Just dropped a new reel - behind the scenes from Lagos.", likes: 112, replies: 31 },
  { id: "3", user: "Ping Team", time: "1h", text: "Welcome to Ping. Say hi with your first ping.", likes: 300, replies: 95 },
];

export default function HomeScreen() {
  return (
    <PhoneScreen padded={false}>
      <View style={styles.header}>
        <Text style={styles.logo}>Ping</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn}><Icon name="search" size={22} color={palette.ink} /></Pressable>
          <Pressable style={styles.iconBtn}><Icon name="notifications" size={22} color={palette.ink} /><View style={styles.badge} /></Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.feed} showsVerticalScrollIndicator={false}>
        {PINGS.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{p.user.charAt(0)}</Text></View>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}><Text style={styles.user}>{p.user}</Text><Text style={styles.time}> - {p.time}</Text></View>
              <Text style={styles.pingText}>{p.text}</Text>
              <View style={styles.actions}>
                <View style={styles.action}><Icon name="heart" size={18} color={palette.muted} /><Text style={styles.actionText}>{p.likes}</Text></View>
                <View style={styles.action}><Icon name="comment" size={18} color={palette.muted} /><Text style={styles.actionText}>{p.replies}</Text></View>
                <Icon name="share" size={18} color={palette.muted} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.line },
  logo: { fontSize: 24, fontWeight: "800", color: palette.ink },
  headerIcons: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 8 },
  badge: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.danger },
  feed: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { flexDirection: "row", gap: 12, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.line, borderRadius: 16, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700", color: palette.primary },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  user: { fontSize: 15, fontWeight: "700", color: palette.ink },
  time: { fontSize: 13, color: palette.muted },
  pingText: { fontSize: 15, lineHeight: 21, color: palette.ink },
  actions: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 12 },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, color: palette.muted, fontWeight: "600" },
});
