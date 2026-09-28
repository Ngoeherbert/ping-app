import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { palette } from "../../../../constants/colors";
import { getConversation } from "../../../../lib/gists";
import PhoneScreen from "../../../../components/navigation/PhoneScreen";

export default function ChatInfoScreen() {
  const { id } = useLocalSearchParams();
  const conversation = getConversation(id);

  const name = conversation?.name ?? "Unknown";
  const avatar = conversation?.avatar ?? undefined;
  const isOnline = conversation?.isOnline ?? false;
  const isGroup = conversation?.isGroup ?? false;
  const isChannel = conversation?.isChannel ?? false;
  const memberCount = conversation?.members?.length ?? 0;
  const members = conversation?.members ?? [];

  const phone = conversation?.phone ?? "+1 (555) 000-20";

  const makeCall = () => {
    router.push({
      pathname: "/(tabs)/gists/[id]/voice-call",
      params: { id: String(id) },
    });
  };

  const makeVideoCall = () => {
    router.push({
      pathname: "/(tabs)/gists/[id]/video-call",
      params: { id: String(id) },
    });
  };

  const [hasExited, setHasExited] = React.useState(false);

  const handleExitGroup = () => {
    setHasExited(true);
  };

  const handleReportGroup = () => {};

  const handleDeleteGroup = () => {
    router.back();
  };

  const renderStatus = () => {
    if (isChannel) {
      return `${memberCount} ${
        memberCount === 1
          ? "subscriber"
          : "subscribers"
      }`;
    }

    if (isGroup) {
      return `${memberCount} ${
        memberCount === 1
          ? "member"
          : "members"
      }`;
    }

    return isOnline
      ? "Online now"
      : "Last seen recently";
  };

  return (
    <PhoneScreen padded={false}>
      <View style={styles.screen}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
            hitSlop={8}
          >
            <Icon name="back" size={22} color={palette.ink} />
          </Pressable>

          <Text style={styles.headerTitle}>Info</Text>

          <Pressable style={styles.headerButton} hitSlop={8}>
            <Icon name="more" size={21} color={palette.ink} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* PROFILE */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <Avatar uri={avatar} name={name} size={112} />

              {!isGroup && !isChannel && isOnline && (
                <View style={styles.onlineIndicator}>
                  <View style={styles.onlineDot} />
                </View>
              )}
            </View>

            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>

             <Text style={styles.status}>{renderStatus()}</Text>

             {!isGroup && !isChannel && (
              <Text style={styles.phone}>{phone}</Text>
            )}
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.quickActions}>
            {!isGroup && !isChannel && (
              <>
                <QuickAction icon="phone" label="Call" onPress={makeCall} />

                <QuickAction
                  icon="video"
                  label="Video"
                  onPress={makeVideoCall}
                />
              </>
            )}

            {isGroup && (
              <>
                <QuickAction
                  icon="microphone"
                  label="Voice"
                  onPress={makeCall}
                />

                <QuickAction
                  icon="addUser"
                  label="Add User"
                  onPress={() => {}}
                />
              </>
            )}

            <QuickAction icon="search" label="Search" onPress={() => {}} />

            {!isGroup && !isChannel && (
              <QuickAction
                icon="user"
                label="View profile"
                onPress={() =>
                  router.push({
                    pathname: "/profile/[id]",
                    params: { id: String(id) },
                  })
                }
              />
            )}
          </View>

          {/* ABOUT */}
          {!isGroup && !isChannel && (
            <Section>
              <View style={styles.about}>
                <View style={styles.aboutIcon}>
                  <Icon name="info" size={18} color={palette.muted} />
                </View>

                <View style={styles.aboutContent}>
                  <Text style={styles.aboutLabel}>About</Text>

                  <Text style={styles.aboutText}>
                    Hey there! I am using Gist.
                  </Text>
                </View>
              </View>
            </Section>
          )}

          {/* CHAT INFORMATION */}
          <Section>
            <SectionHeader title="Chat information" />

            {/* MEDIA */}
            <InfoRow
              icon="image"
              title="Media, links and docs"
              subtitle="24 items"
              onPress={() => {}}
            />

            {/* STORAGE */}
            <InfoRow
              icon="database"
              title="Storage"
              subtitle="128 MB"
              onPress={() => {}}
            />

            {/* GROUP INFO */}
            {isGroup && (
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [
                  styles.userInfoRow,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.userInfoAvatar}>
                  <Avatar uri={avatar} name={name} size={40} />
                </View>

                <View style={styles.userInfoContent}>
                  <Text style={styles.userInfoTitle}>Group info</Text>

                  <Text style={styles.userInfoSubtitle} numberOfLines={2}>
                    {conversation?.description ?? "Tap to add a group description"}
                  </Text>
                </View>

                <Text style={styles.rowArrow}>&#8250;</Text>
               </Pressable>
             )}

            {/* USER INFO */}
            {!isGroup && !isChannel && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/profile/[id]",
                    params: { id: String(id) },
                  })
                }
                style={({ pressed }) => [
                  styles.userInfoRow,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.userInfoAvatar}>
                  <Avatar uri={avatar} name={name} size={40} />
                </View>

                <View style={styles.userInfoContent}>
                  <Text style={styles.userInfoTitle}>User info</Text>

                  <Text style={styles.userInfoSubtitle} numberOfLines={1}>
                    {name} · {phone}
                  </Text>
                </View>

                <Text style={styles.rowArrow}>&#8250;</Text>
              </Pressable>
            )}
          </Section>

          {/* CHAT SETTINGS */}
          <Section>
            <SectionHeader title="Chat settings" />

            <InfoRow
              icon="notifications"
              title="Notifications"
              subtitle="Custom"
              onPress={() => {}}
            />

            <InfoRow
              icon="palette"
              title="Theme"
              subtitle="Light"
              onPress={() => {}}
            />

            <InfoRow
              icon="download"
              title="Save to Photos"
              subtitle="On"
              onPress={() => {}}
            />

            <InfoRow
              icon="clock"
              title="Disappearing messages"
              subtitle="Off"
              onPress={() => {}}
            />
          </Section>

          {/* ENCRYPTION */}
          {!isChannel && (
            <Section>
              <View style={styles.securityRow}>
                <View style={styles.securityIcon}>
                  <Icon name="lock" size={19} color={palette.muted} />
                </View>

                <View style={styles.securityContent}>
                  <Text style={styles.securityTitle}>End-to-end encrypted</Text>

                  <Text style={styles.securityText}>
                    Messages and calls are secured with end-to-end encryption.
                  </Text>
                </View>
              </View>
            </Section>
          )}

           {/* MEMBERS */}
           {isGroup && (
             <Section>
               <SectionHeader title="Members" />

               <InfoRow
                 icon="link"
                 title="Invite links"
                 subtitle="Tap to invite"
                 onPress={() => {}}
               />

               <InfoRow
                 icon="addUser"
                 title="Add member"
                 onPress={() => {}}
               />

               <GroupMembers members={members} />
             </Section>
           )}

  {/* QUICK ACTIONS (personal) */}
  {!isGroup && !isChannel && (
    <Section>
      <InfoRow
        icon="share"
        title="Share contact"
        onPress={() => {}}
        showArrow={false}
      />

      <InfoRow
        icon="star"
        title="Add to favorites"
        onPress={() => {}}
        showArrow={false}
      />

      <InfoRow
        icon="addUser"
        title={`Create group with ${name}`}
        onPress={() => {}}
        showArrow={false}
      />
    </Section>
  )}

           {/* DANGER ZONE */}
           {!isGroup && !isChannel && (
             <Section>
               <InfoRow
                 icon="block"
                 title={`Block ${name}`}
                 destructive
                 onPress={() => {}}
                 showArrow={false}
               />

               <InfoRow
                 icon="flag"
                 title={`Report ${name}`}
                 destructive
                 onPress={() => {}}
                 showArrow={false}
               />

               <InfoRow
                 icon="trash"
                 title="Clear chat"
                 destructive
                 onPress={() => {}}
                 showArrow={false}
               />
             </Section>
           )}

           {/* EXIT / REPORT / DELETE */}
           {isGroup && !isChannel && (
             <Section>
               {!hasExited && (
                 <InfoRow
                   icon="logOut"
                   title="Exit group"
                   destructive
                   onPress={handleExitGroup}
                   showArrow={false}
                 />
               )}

               {!hasExited && (
                 <InfoRow
                   icon="flag"
                   title="Report group"
                   destructive
                   onPress={handleReportGroup}
                   showArrow={false}
                 />
               )}

               {hasExited && (
                 <InfoRow
                   icon="trash"
                   title="Delete group"
                   destructive
                   onPress={handleDeleteGroup}
                   showArrow={false}
                 />
               )}
             </Section>
           )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </PhoneScreen>
  );
}

/* -------------------------------------------------------------------------- */
/* QUICK ACTION                                                               */
/* -------------------------------------------------------------------------- */

function QuickAction({
  icon,
  label,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.quickActionIcon}>
        <Icon
          name={icon}
          size={20}
          color={palette.ink}
        />
      </View>

      <Text style={styles.quickActionLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION                                                                    */
/* -------------------------------------------------------------------------- */

function Section({ children }) {
  return (
    <View style={styles.section}>
      {children}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION HEADER                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* INFO ROW                                                                   */
/* -------------------------------------------------------------------------- */

function InfoRow({
  icon,
  title,
  subtitle,
  onPress,
  destructive = false,
  showArrow = true,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.infoRow,
        pressed && styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.infoIcon,
          destructive &&
            styles.destructiveIcon,
        ]}
      >
        <Icon
          name={icon}
          size={19}
          color={
            destructive
              ? palette.danger
              : palette.muted
          }
        />
      </View>

      <View style={styles.infoContent}>
        <Text
          style={[
            styles.infoTitle,
            destructive &&
              styles.destructiveText,
          ]}
        >
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.infoSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {showArrow && (
        <Text style={styles.rowArrow}>&#8250;</Text>
      )}
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* GROUP MEMBERS                                                               */
/* -------------------------------------------------------------------------- */

function GroupMembers({ members }) {
  return (
    <View style={styles.membersList}>
      {members.map((member) => {
        const isMe = member.id === "you";
        return (
          <Pressable
            key={member.id}
            onPress={() => {}}
            style={({ pressed }) => [
              styles.memberRow,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.memberAvatar}>
              <Avatar uri={member.avatar ?? null} name={member.name} size={44} />
            </View>

            <View style={styles.memberContent}>
              <Text style={styles.memberName} numberOfLines={1}>
                {member.name}
              </Text>
              <Text style={styles.memberStatus}>
                {isMe ? "You" : "Admin"}
              </Text>
            </View>

            {!isMe && (
              <View style={styles.memberChatIcon}>
                <Icon name="message" size={20} color={palette.muted} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },

  scrollContent: {
    paddingBottom: 28,
  },

  /* HEADER */

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7E9",
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 6,
    fontSize: 18,
    fontWeight: "600",
    color: palette.ink,
  },

  /* PROFILE */

  profileCard: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 28,
    backgroundColor: "#FFFFFF",
  },

  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    marginBottom: 15,
  },

  onlineIndicator: {
    position: "absolute",
    right: 3,
    bottom: 4,
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  onlineDot: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#22C55E",
  },

  name: {
    maxWidth: "85%",
    fontSize: 24,
    fontWeight: "700",
    color: palette.ink,
    letterSpacing: -0.4,
  },

  status: {
    marginTop: 5,
    fontSize: 14,
    color: palette.muted,
  },

   phone: {
    marginTop: 4,
    fontSize: 14,
    color: palette.muted,
  },

  /* QUICK ACTIONS */

  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
  },

  quickAction: {
    minWidth: 70,
    alignItems: "center",
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
    backgroundColor: "#F1F3F4",
  },

  quickActionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: palette.ink,
  },

  pressed: {
    opacity: 0.55,
  },

  /* SECTION */

  section: {
    marginTop: 10,
    marginHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.025,
        shadowRadius: 3,
      },

      android: {
        elevation: 1,
      },
    }),
  },

  sectionHeader: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 17,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.muted,
    letterSpacing: 0.1,
  },

  /* ABOUT */

  about: {
    flexDirection: "row",
    paddingHorizontal: 17,
    paddingVertical: 14,
  },

  aboutIcon: {
    width: 34,
    paddingTop: 2,
  },

  aboutContent: {
    flex: 1,
  },

  aboutLabel: {
    fontSize: 13,
    color: palette.muted,
    marginBottom: 4,
  },

  aboutText: {
    fontSize: 15,
    lineHeight: 21,
    color: palette.ink,
  },

  /* INFO ROW */

  infoRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    paddingVertical: 8,
  },

  rowPressed: {
    backgroundColor: "#F7F8F8",
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F6",
  },

  destructiveIcon: {
    backgroundColor: "#FFF1F3",
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: palette.ink,
  },

  infoSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: palette.muted,
  },

   destructiveText: {
    color: palette.danger,
  },

  rowArrow: {
    fontSize: 20,
    color: "#A0A8AE",
    lineHeight: 20,
  },

  /* GROUP MEMBERS */

  membersList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7E9",
  },

  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    paddingVertical: 11,
  },

  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },

  memberContent: {
    flex: 1,
    marginLeft: 12,
  },

  memberName: {
    fontSize: 15,
    fontWeight: "500",
    color: palette.ink,
  },

  memberStatus: {
    marginTop: 2,
    fontSize: 13,
    color: palette.muted,
  },

  memberChatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F6",
  },

  /* USER INFO */

  userInfoRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    paddingVertical: 9,
  },

  userInfoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },

  userInfoContent: {
    flex: 1,
    marginLeft: 12,
  },

  userInfoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.ink,
  },

  userInfoSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: palette.muted,
  },

  /* SECURITY */

  securityRow: {
    flexDirection: "row",
    paddingHorizontal: 17,
    paddingVertical: 15,
  },

  securityIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F6",
  },

  securityContent: {
    flex: 1,
    marginLeft: 12,
  },

  securityTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: palette.ink,
  },

  securityText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: palette.muted,
  },

  bottomSpace: {
    height: 20,
  },
});
