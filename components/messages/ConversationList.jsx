import React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";

import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations = [],
  onConversationPress,
  ListHeaderComponent,
}) {
  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ConversationItem conversation={item} onPress={onConversationPress} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No conversations</Text>

          <Text style={styles.emptyText}>Your messages will appear here.</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingHorizontal: 30,
    paddingTop: 80,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
  },
});
