import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";

import Icon from "../ui/Icon";

export default function NewMessageSheet({ visible, onClose, onSearch }) {
  const [search, setSearch] = useState("");

  const handleSearch = (value) => {
    setSearch(value);
    onSearch?.(value);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>New message</Text>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={21} color="#222222" />
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#777777" />

            <TextInput
              value={search}
              onChangeText={handleSearch}
              placeholder="Search people"
              placeholderTextColor="#888888"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>

          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Start a new conversation</Text>

            <Text style={styles.emptyText}>
              Search for someone to send a message.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    minHeight: 420,
    maxHeight: "85%",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: "#D0D0D0",
  },

  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111111",
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
  },

  searchContainer: {
    height: 46,
    marginTop: 16,
    paddingHorizontal: 13,
    borderRadius: 23,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 15,
    color: "#111111",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 70,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
  },

  emptyText: {
    marginTop: 7,
    maxWidth: 260,
    fontSize: 14,
    lineHeight: 20,
    color: "#888888",
    textAlign: "center",
  },
});
