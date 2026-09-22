import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import UnreadBadge from "./UnreadBadge";

export default function ConversationItem({ conversation, onPress }) {
  const {
    name,
    avatar,
    lastMessage,
    time,
    unreadCount,
    isOnline,
    isMuted,
    isGroup,
    senderName,
  } = conversation;

  return (
    <Pressable
      onPress={() => onPress?.(conversation)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.avatarContainer}>
        <Avatar uri={avatar} name={name} size={54} />

        {isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            numberOfLines={1}
            style={[styles.name, unreadCount > 0 && styles.unreadName]}
          >
            {name}
          </Text>

          <Text style={[styles.time, unreadCount > 0 && styles.unreadTime]}>
            {time}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            numberOfLines={1}
            style={[styles.message, unreadCount > 0 && styles.unreadMessage]}
          >
            {senderName ? `${senderName}: ` : ""}
            {lastMessage}
          </Text>

          <View style={styles.meta}>
            {isMuted && <Icon name="mute" size={15} color="#999999" />}

            {isGroup && <Icon name="users" size={15} color="#999999" />}

            <UnreadBadge count={unreadCount} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  pressed: {
    backgroundColor: "#F7F7F7",
  },

  avatarContainer: {
    width: 56,
    height: 56,
    marginRight: 12,
  },

  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#31C75B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  name: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },

  unreadName: {
    fontWeight: "750",
  },

  time: {
    fontSize: 12,
    color: "#888888",
  },

  unreadTime: {
    color: "#111111",
    fontWeight: "600",
  },

  bottomRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  message: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
    lineHeight: 19,
    color: "#777777",
  },

  unreadMessage: {
    color: "#333333",
    fontWeight: "500",
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
