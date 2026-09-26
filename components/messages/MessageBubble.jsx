import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import Modal from "../ui/Modal";
import VoiceBubble from "./VoiceBubble";
import FileBubble from "./FileBubble";
import ViewOnceBubble from "./ViewOnceBubble";
import VideoBubble from "./VideoBubble";
import ImageBubble from "./ImageBubble";
import ReplyQuote from "./ReplyQuote";
import ViewOnceViewer from "./ViewOnceViewer";
const window = Dimensions.get("window");
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = window;

const SCREEN_PADDING = 16;
const RAIL_WIDTH = 232;
const RAIL_HEIGHT = 48;
const MENU_WIDTH = 240;
const GAP = 10;

/**
 * MessageBubble — renders every gist message type:
 * text | image | video | voice | file (pdf) | view-once
 */
export default function MessageBubble(props) {
  const {
    message,
    item,
    isMine: isMineProp,
    isGroup = false,
    sender: senderProp,
    showSenderHeader = true,
    showAvatar = false,
    time: timeProp,
    status: statusProp,
    type: typeProp = "text",
    onPress,
    onViewOnceOpen,
    onReply,
  } = props;

  const data = useMemo(() => item ?? {}, [item]);
  const kind = data.kind ?? data.type ?? typeProp ?? "text";
  const isMine = data.isMine ?? isMineProp ?? false;
  const time = data.time ?? data.timestamp ?? timeProp;
  const status = data.status ?? statusProp;
  const text = data.text ?? data.caption ?? data.message ?? message;
  const uri = data.uri ?? data.url ?? data.localUri;
  const sender = senderProp ?? data.sender ?? data.user ?? data.userProfile ?? data.profile ?? data.author ?? (
    data.senderName || data.senderAvatar
      ? { name: data.senderName, avatar: data.senderAvatar }
      : null
  );
  const senderName = typeof sender === "string"
    ? sender
    : sender?.name ?? sender?.displayName ?? sender?.fullName ?? data.senderName ?? null;
  const senderAvatar = typeof sender === "object"
    ? sender?.avatar ?? sender?.avatarUri ?? sender?.photoURL ?? sender?.image ?? data.senderAvatar ?? null
    : data.senderAvatar ?? null;
  const showGroupIdentity = isGroup && !isMine && showSenderHeader && Boolean(senderName);
  const isViewOnce = data.viewOnce === true || ["view-once", "view_once", "viewonce"].includes(kind);
  const [viewed, setViewed] = useState(data.viewed ?? false);
  const [viewOnceVisible, setViewOnceVisible] = useState(false);
  const [viewOnceMessage, setViewOnceMessage] = useState(null);

  useEffect(() => {
    setViewed(data.viewed === true);
  }, [data.viewed]);

  // ---------------------------------------------------------------
  // Reaction + message-action UI (iMessage-style long-press)
  // ---------------------------------------------------------------
  const REACTIONS = [
    { emoji: "❤️", label: "Love" },
    { emoji: "👍", label: "Like" },
    { emoji: "👎", label: "Dislike" },
    { emoji: "😂", label: "Laugh" },
    { emoji: "‼️", label: "Emphasize" },
    { emoji: "❓", label: "Question" },
  ];

  const MENU_ITEMS = [
    { id: "reply", label: "Reply", icon: "reply" },
    { id: "forward", label: "Forward", icon: "forward" },
    { id: "edit", label: "Edit", icon: "edit" },
    { id: "copy", label: "Copy", icon: "copy" },
    { id: "translate", label: "Translate", icon: "translate" },
    { id: "more", label: "More", icon: "more" },
  ];
  // NOTE: verify these icon names exist in ../ui/Icon — swap for whatever
  // your icon set calls "reply", "undo", "edit", "copy", "translate", "more".

  // In-memory stores — swap for your real store (Zustand/React Query/SQLite).
  const reactionsStore = useRef(new Map());
  const reactionByMe = reactionsStore.current.get(data.id) ?? null;

  const starredStore = useRef(new Set());
  const isStarred = starredStore.current.has(data.id);

  const [reactionOnlyMode, setReactionOnlyMode] = useState(false);
  const [focusedMessage, setFocusedMessage] = useState(null);
  const [anchor, setAnchor] = useState(null); // { x, y, width, height }

  const insets = useSafeAreaInsets();
  const safeTop = insets.top + SCREEN_PADDING;
  const safeBottom = SCREEN_HEIGHT - insets.bottom - SCREEN_PADDING;

  const bubbleRef = useRef(null);

  const openFocusOnLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setReactionOnlyMode(false);
      setFocusedMessage(data);
    });
  }, [data]);

  const openReactionPickerOnly = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setReactionOnlyMode(true);
      setFocusedMessage(data);
    });
  }, [data]);

  const toggleReaction = useCallback(
    (emoji) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const map = reactionsStore.current;
      const existing = map.get(data.id);
      if (String(existing) === String(emoji)) {
        map.delete(data.id);
      } else {
        map.set(data.id, emoji);
      }
      setViewed((v) => !v);
      setViewed((v) => !v);
    },
    [data.id],
  );

  const clearActiveReactionsPreview = useCallback(() => {
    setFocusedMessage(null);
    setAnchor(null);
    setReactionOnlyMode(false);
  }, []);

  const isMedia = kind === "image" || kind === "photo" || kind === "video";
  const hasCaption = !!String(text ?? "").trim();
  const isBareMedia = isMedia && !isViewOnce && !!uri && !hasCaption && !data.replyTo;

  const handleViewOnce = () => {
    if (viewed) return;
    setViewed(true);
    setViewOnceMessage({ ...data });
    setViewOnceVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onViewOnceOpen?.(data);
  };

  const closeViewOnce = () => {
    setViewOnceVisible(false);
    setViewOnceMessage(null);
  };

  const renderBody = () => {
    if (isViewOnce) {
      return (
        <ViewOnceBubble
          viewed={viewed}
          isMine={isMine}
          message={data}
          onOpen={handleViewOnce}
          onLongPress={openFocusOnLongPress}
        />
      );
    }

    switch (kind) {
      case "image":
      case "photo":
        if (!uri) return null;
        return (
          <ImageBubble
            uri={uri}
            caption={hasCaption ? text : undefined}
            bleed={!isBareMedia && !data.replyTo}
            isMine={isMine}
            onPress={onPress}
            onLongPress={openFocusOnLongPress}
            stickers={data.stickers}
          />
        );

      case "video":
        return (
          <VideoBubble
            uri={uri}
            caption={hasCaption ? text : undefined}
            bleed={!isBareMedia && !data.replyTo}
            isMine={isMine}
            onLongPress={openFocusOnLongPress}
            duration={data.duration ?? 0}
            stickers={data.stickers}
          />
        );

      case "voice":
      case "audio":
        return (
          <VoiceBubble
            uri={uri}
            duration={data.duration ?? 0}
            isMine={isMine}
            waveform={data.waveform}
            time={time}
            status={status}
          />
        );

      case "file":
      case "pdf":
      case "document":
        return (
          <FileBubble
            fileName={data.fileName ?? data.name ?? "document.pdf"}
            fileSize={data.fileSize ?? data.size}
            mimeType={data.mimeType ?? "application/pdf"}
            isMine={isMine}
            onPress={onPress}
            downloaded={data.downloaded ?? false}
            downloading={data.downloading ?? false}
            downloadError={data.downloadError ?? false}
            duration={data.duration}
          />
        );

      case "text":
      default:
        return (
          <View style={styles.textRow}>
            <Text
              style={[
                styles.message,
                isMine ? styles.mineText : styles.theirText,
              ]}
            >
              {text}
            </Text>
          </View>
        );
    }
  };

  const topReactions = REACTIONS; // all 6, iMessage-style
  const currentReaction = reactionByMe ?? null;

  // ---- Floating preview geometry (clamped to screen) ----
  const railLeft = anchor
    ? Math.min(
        Math.max(anchor.x + anchor.width / 2 - RAIL_WIDTH / 2, SCREEN_PADDING),
        SCREEN_WIDTH - RAIL_WIDTH - SCREEN_PADDING,
      )
    : 0;
  const menuLeft = anchor
    ? isMine
      ? Math.min(
          anchor.x + anchor.width - MENU_WIDTH,
          SCREEN_WIDTH - MENU_WIDTH - SCREEN_PADDING,
        )
      : Math.max(anchor.x, SCREEN_PADDING)
    : 0;

  // ---- Vertical clamping: keep rail above, bubble, and menu below on-screen ----
  // The whole floating cluster (rail → bubble → menu) needs to stay within the
  // visible window regardless of scroll position. We compute a single `shift`
  // so all three components move together, leaving the relative layout between
  // them untouched. Positive = shift up, negative = shift down.
  const menuHeightEstimate = MENU_ITEMS.length * 46; // ~44px row + padding
  const bubbleTop = anchor?.y ?? 0;
  const railTop = bubbleTop - RAIL_HEIGHT - GAP;
  const clusterBottom = bubbleTop + (anchor?.height ?? 0) + GAP + menuHeightEstimate;

  let shift = 0;
  if (anchor) {
    const maxBottom = safeBottom;
    const minTop = safeTop;

    // Menu would drop below screen → shift the whole cluster up.
    const overflowBottom = clusterBottom - maxBottom;
    if (overflowBottom > 0) shift = overflowBottom;

    // Rail would climb above screen → shift the whole cluster down.
    const overflowTop = minTop - (railTop - shift);
    if (overflowTop > 0) shift -= overflowTop;
  }

  const clampedTop = anchor ? bubbleTop - shift : 0;

  return (
    <View
      style={[
        styles.row,
        isMine ? styles.mineRow : styles.theirRow,
        !!currentReaction && styles.rowWithReaction,
      ]}
    >
      {isGroup && !isMine ? (
        <View style={styles.groupAvatarSlot}>
          {showGroupIdentity ? (
            <Avatar
              uri={senderAvatar}
              name={senderName ?? "?"}
              size={28}
              style={styles.groupAvatar}
            />
          ) : null}
        </View>
      ) : !isMine && showAvatar ? (
        <View style={styles.avatarSpace} />
      ) : null}

      <View style={[styles.messageStack, isGroup && !isMine && styles.groupMessageStack]}>
        {showGroupIdentity ? (
          <Text style={styles.groupSenderName} numberOfLines={1}>
            {senderName}
          </Text>
        ) : null}

        <Pressable
          ref={bubbleRef}
          onLongPress={openFocusOnLongPress}
          delayLongPress={400}
          accessibilityRole="button"
          accessibilityLabel={`Message from ${isMine ? "you" : senderName ?? "sender"}${isViewOnce ? ": view-once message" : `: ${text ?? ""}`}`}
          accessibilityHint={isViewOnce ? "Tap the message to open it once" : "Swipe horizontally to reply"}
          style={({ pressed }) => [
            styles.bubble,
            isMine ? styles.mineBubble : styles.theirBubble,
            isGroup && !isMine && styles.groupBubble,
            isBareMedia && styles.bareBubble,
            pressed && styles.bubblePressed,
          ]}
        >
          {data.replyTo && <ReplyQuote replyTo={data.replyTo} isMine={isMine} />}
          {renderBody()}

          {!!currentReaction && (
            <Pressable
              onPress={openReactionPickerOnly}
              hitSlop={8}
              style={styles.reactionBadge}
              accessibilityRole="button"
              accessibilityLabel="Change reaction"
            >
              <Text style={styles.reactionBadgeText}>{currentReaction}</Text>
            </Pressable>
          )}

           {(!!time || (isMine && !!status)) && kind !== "voice" && kind !== "audio" &&
             (isBareMedia ? (
               <View style={styles.mediaMeta} pointerEvents="none">
                 <Text style={styles.mediaTime}>{time}</Text>
                 {isMine && status && (
                   <Icon name="check" size={12} color="#FFFFFF" />
                 )}
               </View>
             ) : (
               <View style={styles.meta}>
                 <Text
                   style={[
                     styles.time,
                     isMine ? styles.mineTime : styles.theirTime,
                   ]}
                 >
                   {time}
                 </Text>
                 {isMine && status && (
                   <Icon name="check" size={13} color="#777777" />
                 )}
                 {isStarred && <Icon name="star" size={13} color="#F5A524" />}
               </View>
             ))}
        </Pressable>
      </View>

      {isViewOnce && viewOnceVisible && (
        <ViewOnceViewer
          visible={viewOnceVisible}
          message={viewOnceMessage}
          onClose={closeViewOnce}
        />
      )}

      {/* Floating long-press preview: blur + reaction rail + real bubble + menu */}
      {focusedMessage && anchor && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={clearActiveReactionsPreview}
        >
          <View style={styles.focusBackdrop}>
            <BlurView
              intensity={60}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={clearActiveReactionsPreview}
            />
          </View>

           {/* Reaction pill, anchored just above the bubble */}
           <View
             style={[
               styles.reactionRailFloating,
               {
                 top: clampedTop - RAIL_HEIGHT - GAP,
                 left: railLeft,
               },
             ]}
           >
            {topReactions.map((r) => (
              <Pressable
                key={r.emoji}
                onPress={() => {
                  toggleReaction(r.emoji);
                  clearActiveReactionsPreview();
                }}
                style={styles.reactionButtonFloating}
                accessibilityLabel={r.label}
              >
                <Text style={styles.reactionEmojiFloating}>{r.emoji}</Text>
              </Pressable>
            ))}
          </View>

           {!reactionOnlyMode && (
             <>
               {/* The bubble itself, redrawn in its exact real position */}
                <View
                  pointerEvents="none"
                  style={[
                    styles.bubble,
                    isMine ? styles.mineBubble : styles.theirBubble,
                    isBareMedia && styles.bareBubble,
                    {
                      position: "absolute",
                      top: clampedTop,
                      left: anchor.x,
                      width: anchor.width,
                      maxWidth: anchor.width,
                    },
                  ]}
                >
                   {data.replyTo && (
                     <ReplyQuote replyTo={data.replyTo} isMine={isMine} />
                   )}
                   {renderBody()}

                 {!!currentReaction && (
                   <Pressable
                     onPress={openReactionPickerOnly}
                     hitSlop={8}
                     style={styles.reactionBadge}
                     accessibilityRole="button"
                     accessibilityLabel="Change reaction"
                   >
                     <Text style={styles.reactionBadgeText}>{currentReaction}</Text>
                   </Pressable>
                 )}

                 {(!!time || (isMine && !!status)) &&
                   kind !== "voice" && kind !== "audio" &&
                   (isBareMedia ? (
                     <View style={styles.mediaMeta} pointerEvents="none">
                       <Text style={styles.mediaTime}>{time}</Text>
                       {isMine && status && (
                         <Icon name="check" size={12} color="#FFFFFF" />
                       )}
                     </View>
                   ) : (
                     <View style={styles.meta}>
                       <Text
                         style={[
                           styles.time,
                           isMine ? styles.mineTime : styles.theirTime,
                         ]}
                       >
                         {time}
                       </Text>
                       {isMine && status && (
                         <Icon name="check" size={13} color="#777777" />
                       )}
                       {isStarred && <Icon name="star" size={13} color="#F5A524" />}
                     </View>
                   ))}
               </View>

                {/* Action menu, anchored just below the bubble */}
               <View
                 style={[
                   styles.menuCardFloating,
                   {
                     top: clampedTop + anchor.height + GAP,
                     left: menuLeft,
                     width: MENU_WIDTH,
                   },
                 ]}
               >
                {MENU_ITEMS.map((item, idx) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      clearActiveReactionsPreview();
                      if (item.id === "reply") onReply?.(data);
                    }}
                    style={[
                      styles.menuRowFloating,
                      idx === MENU_ITEMS.length - 1 &&
                        styles.menuRowFloatingLast,
                    ]}
                  >
                    <Text style={styles.menuRowLabel}>{item.label}</Text>
                    <Icon name={item.icon} size={18} color="#8E8E93" />
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
  },
  mineRow: { justifyContent: "flex-end" },
  theirRow: { justifyContent: "flex-start" },
  // Extra bottom space so a hanging reaction badge never overlaps the next bubble
  rowWithReaction: { marginBottom: 18 },
  avatarSpace: { width: 28, marginRight: 5 },
  messageStack: { flexShrink: 1 },
  groupAvatarSlot: {
    width: 36,
    marginRight: 6,
    alignItems: "center",
    alignSelf: "flex-start",
    paddingTop: 1,
  },
  groupMessageStack: { flex: 1, minWidth: 0 },
  groupAvatar: { borderWidth: 1, borderColor: "#FFFFFF" },
  groupSenderName: {
    marginBottom: 3,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "600",
    color: "#555555",
    textAlign: "left",
  },
  groupBubble: { maxWidth: "100%", alignSelf: "flex-start" },

  bubble: {
    position: "relative",
    maxWidth: "78%",
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 6,
    borderRadius: 18,
    overflow: "visible",
  },
  mineBubble: { backgroundColor: "#111111", borderBottomRightRadius: 5 },
  theirBubble: { backgroundColor: "#EEEEEE", borderBottomLeftRadius: 5 },
  message: { fontSize: 15, lineHeight: 20 },
  mineText: { color: "#FFFFFF" },
  theirText: { color: "#222222" },
  bareBubble: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "transparent",
  },

  mediaMeta: {
    position: "absolute",
    right: 8,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  mediaTime: { fontSize: 10, color: "#FFFFFF" },
  meta: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
  },
  textRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },

  // Reaction badge — anchored bottom-left of the bubble, hanging off the edge
  reactionBadge: {
    position: "absolute",
    left: -6,
    bottom: -10,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
    zIndex: 2,
  },
  reactionBadgeText: { fontSize: 13, lineHeight: 16 },

  time: { fontSize: 10 },
  mineTime: { color: "#AAAAAA" },
  theirTime: { color: "#999999" },
  bubblePressed: { opacity: 0.92 },

  focusBackdrop: { flex: 1 },

  // Floating reaction pill (iMessage tapback bar)
  reactionRailFloating: {
    position: "absolute",
    height: RAIL_HEIGHT,
    borderRadius: RAIL_HEIGHT / 2,
    backgroundColor: "rgba(250,250,250,0.98)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  reactionButtonFloating: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  reactionEmojiFloating: { fontSize: 22 },

  // Floating action menu (label left, icon right, hairline separators)
  menuCardFloating: {
    position: "absolute",
    backgroundColor: "rgba(250,250,250,0.98)",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuRowFloating: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.12)",
  },
  menuRowFloatingLast: { borderBottomWidth: 0 },
  menuRowLabel: { fontSize: 16, color: "#111111" },
});

export function describeMessageText(message) {
  return (message?.text ?? message?.message ?? message?.caption ?? "").trim();
}

export function messageHasReaction(reactionsStore, message) {
  if (!reactionsStore || !message) return false;
  return Boolean(reactionsStore.get(message.id));
}
