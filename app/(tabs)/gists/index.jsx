import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import PhoneScreen from "../../../components/navigation/PhoneScreen";
import Icon from "../../../components/ui/Icon";
import MessageSearch from "../../../components/messages/MessageSearch";
import MessageFilters from "../../../components/messages/MessageFilters";
import ConversationList from "../../../components/messages/ConversationList";
import NewMessageSheet from "../../../components/messages/NewMessageSheet";
import { CONVERSATIONS } from "../../../lib/gists";
import { palette } from "../../../constants/colors";

export default function GistsScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sheetVisible, setSheetVisible] = useState(false);

  const conversations = useMemo(() => {
    const list = Array.isArray(CONVERSATIONS) ? CONVERSATIONS : [];
    const q = (query ?? "").trim().toLowerCase();
    return list.filter((c) => {
      if (filter === "unread" && !(c.unreadCount > 0)) return false;
      if (filter === "groups" && !c.isGroup) return false;
      if (filter === "channels" && !c.isChannel) return false;
      if (q && !`${c.name} ${c.lastMessage}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, filter]);

  return (
    <PhoneScreen padded={false} style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.sub}>Your gists live here</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New message"
          style={({ pressed }) => [styles.compose, pressed && { opacity: 0.7 }]}
          onPress={() => setSheetVisible(true)}
        >
          <Icon name="edit" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <MessageSearch value={query} onChangeText={setQuery} placeholder="Search gists" />
      </View>

      <MessageFilters activeFilter={filter} onChange={setFilter} />

      <View style={styles.list}>
        <ConversationList
          conversations={conversations}
          onConversationPress={(c) =>
            router.push({ pathname: "/(tabs)/gists/[id]", params: { id: String(c.id) } })
          }
        />
      </View>

      <NewMessageSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: "800", color: palette.ink },
  sub: { fontSize: 14, color: palette.muted, marginTop: 2 },
  compose: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: { paddingVertical: 4 },
  list: { flex: 1, paddingTop: 4 },
});
