import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { palette } from "../../../../constants/colors";
import { getConversation } from "../../../../lib/gists";
import PhoneScreen from "../../../../components/navigation/PhoneScreen";

export default function ChatInfoScreen() {
  const { id } = useLocalSearchParams();
  const conversation = getConversation(id);

  const name = conversation?.name ?? "?";
  const avatar = conversation?.avatar ?? undefined;
  const isOnline = conversation?.isOnline ?? false;
  const isGroup = conversation?.isGroup ?? false;
  const isChannel = conversation?.isChannel ?? false;
  const lastMessage = conversation?.lastMessage ?? "";

  const makeCall = () => {
    router.push({
      pathname: "/(tabs)/gists/[id]/voice-call",
      params: { id: String(id) },
    });
  };

  const makeVideoCall = () => {
    router.push({
      pathname: "/(tabs)/gists/[id]/video-call",
      params: { id: String(id) },
    });
  };

  return (
    <PhoneScreen padded={false}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Icon name="back" size={22} color={palette.ink} />
          </Pressable>
          <Text style={styles.topBarTitle}>Info</Text>
          <Pressable>
            <Icon name="more" size={22} color={palette.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Avatar uri={avatar} name={name} size={90} />
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.status}>
              {isGroup ? (
                `Group · ${isChannel ? "Channel" : "Chat"}`
              ) : isOnline ? (
                "Online"
              ) : (
                "Last seen recently"
              )}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn} onPress={makeCall}>
              <Icon name="phone" size={20} color="#FFFFFF" />
              <Text style={styles.actionLabel}>Call</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={makeVideoCall}>
              <Icon name="video" size={20} color="#FFFFFF" />
              <Text style={styles.actionLabel}>Video</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+1 (555) 000-{id}0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{name.toLowerCase().replace(/ /g, ".")}@ping.app</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Messages</Text>
              <Text style={styles.infoValue}>{lastMessage || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {isGroup ? (isChannel ? "Channel" : "Group") : "Personal"}
              </Text>
            </View>
          </View>
        </ScrollView>
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
  topBarTitle: { fontSize: 16, fontWeight: "600", color: palette.ink },
  content: { paddingBottom: 40 },
  avatarSection: { alignItems: "center", paddingVertical: 24, gap: 8 },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
  },
  name: { fontSize: 22, fontWeight: "700", color: palette.ink },
  status: { fontSize: 14, color: palette.muted },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 24,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  actionLabel: { fontSize: 10, color: "#FFFFFF", fontWeight: "500" },
  section: { paddingHorizontal: 20, gap: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.muted,
    textTransform: "uppercase",
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  infoLabel: { fontSize: 14, color: palette.ink, fontWeight: "500" },
  infoValue: { fontSize: 14, color: palette.muted },
});
