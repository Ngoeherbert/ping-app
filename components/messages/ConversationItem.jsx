import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import UnreadBadge from "./UnreadBadge";

export default function ConversationItem({ conversation, onPress, activeFilter }) {
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
    lastCall,
    lastCallType,
    lastCallCategory,
    callFrom,
    callTime,
    isConference,
  } = conversation;

  const isCallsMode = activeFilter === "calls";

  const getCallLabel = () => {
    if (!lastCall || !lastCallCategory) return null;

    const caller =
      lastCallCategory === "outgoing"
        ? name
        : callFrom ?? senderName ?? name;

    const verb =
      lastCallCategory === "missed"
        ? "Missed"
        : lastCallCategory === "outgoing"
        ? "Outgoing"
        : "Incoming";

    const typeLabel = lastCallType === "video" ? "video" : "voice";
    const groupLabel = isConference || isGroup ? ", group" : "";

    return `${verb} ${typeLabel} call${verb === "Missed" ? ` from ${caller}` : groupLabel}`;
  };

  const getCallIcon = () => {
    if (!lastCall || !lastCallCategory) return null;

    if (lastCallCategory === "missed") {
      return <Icon name="callEnd" size={16} color="#E5484D" />;
    }

    if (lastCallType === "video") {
      return <Icon name="video" size={16} color="#0B8D71" />;
    }

    return <Icon name="phone" size={16} color="#0B8D71" />;
  };

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

          <Text
            style={[
              styles.time,
              unreadCount > 0 && styles.unreadTime,
              isCallsMode && styles.callsTime,
            ]}
          >
            {isCallsMode && callTime ? callTime : time}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          {isCallsMode && lastCall ? (
            <>
              {getCallIcon()}

              <Text
                numberOfLines={1}
                style={[
                  styles.callLabel,
                  lastCallCategory === "missed" && styles.missedCall,
                  unreadCount > 0 && styles.unreadMessage,
                ]}
              >
                {getCallLabel()}
              </Text>

              {lastCallCategory === "missed" && conversation.missedCalls ? (
                <View style={styles.missedBadge}>
                  <Text style={styles.missedBadgeText}>{conversation.missedCalls}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.message, unreadCount > 0 && styles.unreadMessage]}
            >
              {senderName ? `${senderName}: ` : ""}
              {lastMessage}
            </Text>
          )}

          {!isCallsMode && (
            <View style={styles.meta}>
              {isMuted && <Icon name="mute" size={15} color="#999999" />}

              {isGroup && <Icon name="users" size={15} color="#999999" />}

              <UnreadBadge count={unreadCount} />
            </View>
          )}
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

  callsTime: {
    fontSize: 12,
    color: "#888888",
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

  callLabel: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
    lineHeight: 19,
    color: "#777777",
    marginLeft: 6,
  },

  missedCall: {
    color: "#E5484D",
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  missedBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5484D",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  missedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
