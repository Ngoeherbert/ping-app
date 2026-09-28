import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import PhoneScreen from "../../../../components/navigation/PhoneScreen";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { palette } from "../../../../constants/colors";
import { AI_NAME } from "../../../../lib/ai";

const AI_DETAILS = [
  { label: "Model", value: "Ping AI v2" },
  { label: "Voice", value: "Realtime" },
  { label: "Memory", value: "This conversation only" },
  { label: "Type", value: "Assistant" },
];

export default function AiChatInfoScreen() {
  return (
    <PhoneScreen padded={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="back" size={22} color={palette.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Info</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Avatar uri={null} name="AI" size={100} />
            </View>
            <Text style={styles.profileName}>{AI_NAME}</Text>
            <Text style={styles.profileStatus}>Online · answers out loud</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Voice</Text>
            <Pressable
              onPress={() => router.push("/(tabs)/gists/ai/voice")}
              accessibilityRole="button"
              accessibilityLabel="Open voice mode"
              style={({ pressed }) => [styles.voiceRow, pressed && styles.voiceRowPressed]}
            >
              <Icon name="aiAudio" size={20} color={palette.ink} />
              <Text style={styles.voiceLabel}>Talk to {AI_NAME} instead of typing</Text>
              <Icon name="forward" size={18} color={palette.muted} />
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Details</Text>
            {AI_DETAILS.map((row) => (
              <View key={row.label} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.about}>
              {`${AI_NAME} is a voice-first assistant. Talk to it the way you would to a
              colleague — ask for a summary, a draft, or the next step.`}
            </Text>
          </View>
        </ScrollView>
      </View>
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F4F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F5",
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600", color: palette.ink },

  scrollContent: { paddingBottom: 32, paddingTop: 12 },

  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
  },
  avatarWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    marginBottom: 12,
  },
  profileName: { fontSize: 22, fontWeight: "700", color: palette.ink },
  profileStatus: { fontSize: 14, color: palette.muted, marginTop: 4 },

  card: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.muted,
    textTransform: "uppercase",
    paddingBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  rowLabel: { fontSize: 15, color: palette.ink, fontWeight: "500" },
  rowValue: { fontSize: 15, color: palette.muted },

  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: palette.surface,
  },
  voiceRowPressed: { opacity: 0.6 },
  voiceLabel: { flex: 1, fontSize: 14, color: palette.ink, fontWeight: "500" },

  about: { fontSize: 14, lineHeight: 20, color: palette.muted, paddingBottom: 4 },
});
