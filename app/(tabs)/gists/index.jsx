import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import PhoneScreen from "../../../components/navigation/PhoneScreen";
import Icon from "../../../components/ui/Icon";
import MessageFilters from "../../../components/messages/MessageFilters";
import MessageSearch from "../../../components/messages/MessageSearch";
import ConversationList from "../../../components/messages/ConversationList";
import NewMessageSheet from "../../../components/messages/NewMessageSheet";
import { CONVERSATIONS } from "../../../lib/gists";
import { palette } from "../../../constants/colors";

export default function GistsScreen() {
  const [filter, setFilter] = useState("all");
  const [sheetVisible, setSheetVisible] = useState(false);
  // Search lives behind the header icon, so the list has room to breathe.
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  const conversations = useMemo(() => {
    const list = Array.isArray(CONVERSATIONS) ? CONVERSATIONS : [];
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      if (filter === "unread" && !(c.unreadCount > 0)) return false;
      if (filter === "groups" && !c.isGroup) return false;
      if (filter === "channels" && !c.isChannel) return false;
      if (q && !`${c.name} ${c.lastMessage}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  return (
    <PhoneScreen padded={false} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Gists</Text>

        {/* Icon-only twin of the removed search bar, for the same job. */}
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search gists"
            style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
            onPress={() => setSearchOpen(true)}
          >
            <Icon name="search" size={20} color={palette.ink} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="New message"
            style={({ pressed }) => [styles.compose, pressed && styles.headerBtnPressed]}
            onPress={() => setSheetVisible(true)}
          >
            <Icon name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <MessageFilters activeFilter={filter} onChange={setFilter} />

      {/* Search drops in over the list so the header keeps its single clean
          row of icons. */}
      {searchOpen && (
        <View style={styles.searchBar}>
          <MessageSearch value={query} onChangeText={setQuery} placeholder="Search gists" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close search"
            onPress={closeSearch}
            style={({ pressed }) => [styles.closeSearch, pressed && styles.headerBtnPressed]}
          >
            <Icon name="close" size={20} color={palette.ink} />
          </Pressable>
        </View>
      )}

      <View style={styles.list}>
        <ConversationList
          conversations={conversations}
          onConversationPress={(c) =>
            router.push({ pathname: "/(tabs)/gists/[id]", params: { id: String(c.id) } })
          }
        />
      </View>

      <NewMessageSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />

      {/* Shortcut into the AI chat. The list carries matching bottom padding so
          the last row can still scroll clear of it. */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push("/(tabs)/gists/ai")}
        accessibilityRole="button"
        accessibilityLabel="Open Ping AI"
        accessibilityHint="Chat with the assistant"
      >
        <Icon name="sparkle" size={24} color="#FFFFFF" />
      </Pressable>
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

  headerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnPressed: { opacity: 0.6 },

  compose: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.dark,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBar: { flexDirection: "row", alignItems: "center", gap: 4 },
  closeSearch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  list: { flex: 1, paddingTop: 4, paddingBottom: 104 },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
});
