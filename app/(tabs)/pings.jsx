import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import Avatar from "../../components/ui/Avatar";
import Icon from "../../components/ui/Icon";
import VerifiedBadge from "../../components/ui/VerifiedBadge";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { useSocialData } from "../../hooks";
import { FOLLOWINGS } from "../../lib/mockData";

function PingsHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Pings</Text>
    </View>
  );
}

function FriendRequestCard({ user, onAccept, onIgnore }) {
  const { name, handle, avatar, verified, verifiedVariant } = user;

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestAvatar}>
        <Avatar uri={avatar} name={name} size={56} />
        {verified && <VerifiedBadge variant={verifiedVariant || "blue"} size={14} inline />}
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{name}</Text>
        <Text style={styles.requestHandle}>{handle}</Text>
        <Text style={styles.requestText}>wants to be friends</Text>
      </View>
      <View style={styles.requestActions}>
        <Pressable
          style={[styles.requestBtn, styles.acceptBtn]}
          accessibilityRole="button"
          onPress={onAccept}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </Pressable>
        <Pressable
          style={[styles.requestBtn, styles.ignoreBtn]}
          accessibilityRole="button"
          onPress={onIgnore}
        >
          <Icon name="x" size={16} color={palette.muted} />
        </Pressable>
      </View>
    </View>
  );
}

function SuggestionCard({ user, followed, onFollow, onProfilePress }) {
  const { name, handle, avatar, verified, verifiedVariant } = user;

  return (
    <View style={styles.suggestionCard}>
      <Pressable
        style={styles.suggestionAvatar}
        accessibilityRole="button"
        accessibilityLabel={`View ${name}'s profile`}
        onPress={() => onProfilePress(user)}
      >
        <Avatar uri={avatar} name={name} size={56} />
        {verified && <VerifiedBadge variant={verifiedVariant || "blue"} size={14} inline />}
      </Pressable>
      <View style={styles.suggestionInfo}>
        <Text style={styles.suggestionName}>{name}</Text>
        <Text style={styles.suggestionHandle}>{handle}</Text>
      </View>
      <Pressable
        style={[
          styles.followBtn,
          followed && styles.followingBtn,
        ]}
        accessibilityRole="button"
        onPress={onFollow}
      >
        <Text style={[styles.followText, followed && styles.followingText]}>
          {followed ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function PingsScreen() {
  const router = useRouter();
  const { notifications } = useSocialData();
  const friendRequests = notifications.filter((n) => n.type === "follow");

  const suggestions = FOLLOWINGS.slice(0, 3);

  const handleAccept = (request) => {
    console.log("Accept friend request from", request.user);
  };

  const handleIgnore = (request) => {
    console.log("Ignore friend request from", request.user);
  };

  const handleFollow = (user) => {
    console.log("Toggle follow for", user.name);
  };

  const handleProfilePress = (user) => {
    if (user.userId || user.id) {
      router.push(`/profile/${encodeURIComponent(user.userId || user.id)}`);
    }
  };

  const friendRequestUsers = friendRequests.map((n) => ({
    id: n.userId,
    name: n.user,
    handle: n.userId ? undefined : undefined,
    avatar: n.avatar,
    verified: n.verified,
    verifiedVariant: n.verifiedVariant,
  }));

  return (
    <PhoneScreen padded={false}>
      <PingsHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feed}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="See all requests">
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {friendRequestUsers.length > 0 ? (
          friendRequestUsers.map((u) => (
            <FriendRequestCard
              key={u.id}
              user={u}
              onAccept={() => handleAccept(u)}
              onIgnore={() => handleIgnore(u)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="users" size={48} color={palette.muted} />
            <Text style={styles.emptyTitle}>No friend requests</Text>
            <Text style={styles.emptyText}>You don&apos;t have any friend requests right now.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>People You May Know</Text>
        </View>

        {suggestions.length > 0 ? (
          suggestions.map((u) => (
            <SuggestionCard
              key={u.id}
              user={u}
              followed={false}
              onFollow={() => handleFollow(u)}
              onProfilePress={handleProfilePress}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="users" size={48} color={palette.muted} />
            <Text style={styles.emptyTitle}>No suggestions right now</Text>
          </View>
        )}
      </ScrollView>
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    backgroundColor: palette.card,
  },
  title: { fontSize: 28, fontWeight: "800", color: palette.ink },

  feed: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: palette.ink },
  seeAll: { fontSize: 13, color: palette.primary },

  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: 14,
    paddingVertical: 12,
  },
  requestAvatar: {
    position: "relative",
    width: 56,
    height: 56,
  },
  requestInfo: { flex: 1, minWidth: 0 },
  requestName: { fontSize: 15, fontWeight: "700", color: palette.ink },
  requestHandle: { fontSize: 13, color: palette.muted, marginTop: 1 },
  requestText: { fontSize: 13, color: palette.muted, marginTop: 2 },

  requestActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtn: { backgroundColor: palette.primary },
  acceptText: { fontSize: 13, fontWeight: "700", color: palette.card },
  ignoreBtn: { backgroundColor: palette.surface },

  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: 14,
    paddingVertical: 12,
  },
  suggestionAvatar: {
    position: "relative",
    width: 56,
    height: 56,
  },
  suggestionInfo: { flex: 1, minWidth: 0 },
  suggestionName: { fontSize: 15, fontWeight: "700", color: palette.ink },
  suggestionHandle: { fontSize: 13, color: palette.muted, marginTop: 1 },

  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
  },
  followingBtn: { backgroundColor: palette.ink },
  followText: { fontSize: 13, fontWeight: "500", color: palette.ink },
  followingText: { color: palette.card },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: palette.ink },
  emptyText: { fontSize: 13, color: palette.muted, textAlign: "center", maxWidth: 240 },
});
