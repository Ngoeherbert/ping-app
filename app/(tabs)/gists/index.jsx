import React, { useRef, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import PhoneScreen from "../../../components/navigation/PhoneScreen";
import Icon from "../../../components/ui/Icon";
import MessageFilters from "../../../components/messages/MessageFilters";
import ConversationList from "../../../components/messages/ConversationList";
import NewMessageSheet from "../../../components/messages/NewMessageSheet";
import { CONVERSATIONS } from "../../../lib/gists";
import { palette } from "../../../constants/colors";

export default function GistsScreen() {
  const [filter, setFilter] = useState("all");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const inputRef = useRef(null);

  const openSearch = () => {
    setSearchOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const conversations = useMemo(() => {
    const list = Array.isArray(CONVERSATIONS) ? CONVERSATIONS : [];
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      if (filter === "unread" && !(c.unreadCount > 0)) return false;
      if (filter === "groups" && !c.isGroup) return false;
      if (filter === "channels" && !c.isChannel) return false;
      if (filter === "calls" && !c.lastCall) return false;
      if (q && !`${c.name} ${c.lastMessage}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [filter, query]);

  return (
    <PhoneScreen padded={false} style={styles.screen}>
      <View style={styles.header}>
        {!searchOpen && <Text style={styles.title}>Gists</Text>}

        {searchOpen && (
          <View style={styles.searchContainer}>
            <Icon name="search" size={21} color="#777777" />
            <TextInput
              ref={inputRef}
              placeholder="Search"
              placeholderTextColor="#888888"
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        <View style={styles.headerActions}>
          {!searchOpen && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search gists"
              style={({ pressed }) => [
                styles.headerBtn,
                pressed && styles.headerBtnPressed,
              ]}
              onPress={openSearch}
            >
              <Icon name="search" size={20} color={palette.ink} />
            </Pressable>
          )}

          {searchOpen ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close search"
              style={({ pressed }) => [
                styles.headerBtn,
                pressed && styles.headerBtnPressed,
              ]}
              onPress={closeSearch}
            >
              <Icon name="close" size={20} color={palette.ink} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New message"
              style={({ pressed }) => [
                styles.compose,
                pressed && styles.headerBtnPressed,
              ]}
              onPress={() => setSheetVisible(true)}
            >
              <Icon name="plus" size={22} color={palette.ink} />
            </Pressable>
          )}
        </View>
      </View>

      <MessageFilters activeFilter={filter} onChange={setFilter} />

      <View style={styles.list}>
        <ConversationList
          conversations={conversations}
          activeFilter={filter}
          onConversationPress={(c) =>
            router.push({
              pathname: "/(tabs)/gists/[id]",
              params: { id: String(c.id) },
            })
          }
        />
      </View>

      <NewMessageSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />

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
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: "800", color: palette.ink },

  headerActions: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4,
    borderRadius: 50,
  },
  headerBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnPressed: { opacity: 0.6 },

  compose: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: "#F2F2F2",
  },
  searchInput: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 15,
    color: "#111111",
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
