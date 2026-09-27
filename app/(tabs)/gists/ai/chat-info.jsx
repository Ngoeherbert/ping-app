import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import PhoneScreen from "../../../../components/navigation/PhoneScreen";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { palette } from "../../../../constants/colors";

const AI_NAME = "Ping AI";

/** Facts about the assistant, in the same shape the thread's info screen uses. */
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
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="back" size={22} color={palette.ink} />
          </Pressable>
          <Text style={styles.topBarTitle}>Info</Text>
          {/* A real "more" menu belongs here later; an inert button would just
              invite a tap that does nothing, so the slot stays empty. */}
          <View style={styles.topBarSlot} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Avatar uri={null} name="AI" size={90} />
            </View>
            <Text style={styles.name}>{AI_NAME}</Text>
            <Text style={styles.status}>Online · replies with voice</Text>
          </View>

          {/* No call buttons: an assistant has no phone line to ring. */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            {AI_DETAILS.map((row) => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
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
  screen: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarTitle: { fontSize: 16, fontWeight: "600", color: palette.ink },
  topBarSlot: { width: 22, height: 22 },

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

  section: { paddingHorizontal: 20, gap: 4, paddingTop: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.muted,
    textTransform: "uppercase",
    paddingBottom: 8,
  },
  about: { fontSize: 14, lineHeight: 20, color: palette.muted },

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
