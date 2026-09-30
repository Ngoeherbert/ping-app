import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { setStatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import Icon from "../../components/ui/Icon";
import Avatar from "../../components/ui/Avatar";
import VerifiedBadge from "../../components/ui/VerifiedBadge";
import CustomModalSheet from "../../components/ui/CustomModalSheet";
import ReelItem from "../../components/reels/ReelItem";
import { palette } from "../../constants/colors";
import { useReelsData } from "../../hooks/useReelsData";
import { useSocialData } from "../../hooks/useSocialData";
import { getReelComments } from "../../lib/mockData";

const TABS = [
  { key: "forYou", label: "For you" },
  { key: "following", label: "Following" },
];

function ReelsTopBar({ topInset, activeTab, onChangeTab }) {
  return (
    <View
      style={[styles.topBar, { paddingTop: topInset + 6 }]}
      pointerEvents="box-none"
    >
      <View style={styles.segments} pointerEvents="box-none">
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChangeTab(tab.key)}
              style={({ pressed }) => [
                styles.segment,
                active && styles.segmentActive,
                pressed && styles.segmentPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
            >
              <Text
                style={[styles.segmentText, active && styles.segmentTextActive]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ReelCommentsSheet({ sheetRef, reel, onClose }) {
  const [text, setText] = useState("");
  const [local, setLocal] = useState([]);

  const comments = useMemo(() => {
    if (!reel) return [];
    return [...local, ...getReelComments(reel.id)];
  }, [local, reel]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLocal((list) => [
      {
        id: `local-${Date.now()}`,
        user: "You",
        handle: "@you",
        avatar: "https://picsum.photos/seed/me/120/120",
        verified: false,
        text: value,
        time: "now",
        likes: 0,
      },
      ...list,
    ]);
    setText("");
  };

  return (
    <CustomModalSheet
      ref={sheetRef}
      title={`Comments${reel?.comments ? ` · ${reel.comments}` : ""}`}
      onClose={onClose}
      showCloseButton
      footer={
         <View style={styles.commentInputRow}>
          <Avatar uri="https://picsum.photos/seed/me/120/120" name="You" size={32} />
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={palette.muted}
              value={text}
              onChangeText={setText}
              onSubmitEditing={submit}
              returnKeyType="send"
              blurOnSubmit={false}
              multiline
            />
          </View>
          <Pressable
            onPress={submit}
            style={[styles.commentSend, !text.trim() && styles.commentSendDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Post comment"
          >
            <Icon name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      }
    >
      <ScrollView
        style={styles.sheetList}
        contentContainerStyle={styles.sheetListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      {comments.length === 0 ? (
        <View style={styles.sheetEmpty}>
          <Icon name="comment" size={32} color={palette.muted} />
          <Text style={styles.sheetEmptyText}>
            No comments yet. Be the first to comment.
          </Text>
        </View>
      ) : (
        comments.map((comment) => (
          <View key={comment.id} style={styles.commentRow}>
            <Avatar uri={comment.avatar} name={comment.user} size={36} />
            <View style={styles.commentBody}>
              <View style={styles.commentHead}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                {comment.verified && (
                  <VerifiedBadge
                    variant={comment.verifiedVariant || "blue"}
                    size={13}
                    inline
                  />
                )}
                <Text style={styles.commentTime}>{comment.time}</Text>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
              <View style={styles.commentActions}>
                <Text style={styles.commentAction}>Reply</Text>
                <View style={styles.commentLikeRow}>
                  <Icon name="heart" size={14} color={palette.muted} />
                  <Text style={styles.commentAction}>{comment.likes}</Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}

      </ScrollView>
    </CustomModalSheet>
  );
}

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reels, currentIndex, likeReel, saveReel, setCurrentIndex } =
    useReelsData();
  const { followings } = useSocialData();

  const [activeTab, setActiveTab] = useState("forYou");
  const [itemHeight, setItemHeight] = useState(0);
  const [commentReel, setCommentReel] = useState(null);
  const commentsRef = useRef(null);

  // Reels are full-bleed dark, so the status bar flips to light content while
  // this tab is focused and back to dark when the user leaves the tab.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
  );

  const followingIds = useMemo(
    () => new Set(followings.map((f) => f.id)),
    [followings]
  );

  const data = useMemo(() => {
    if (activeTab === "following") {
      return reels.filter((reel) => followingIds.has(reel.userId));
    }
    return reels;
  }, [activeTab, followingIds, reels]);

  const listRef = useRef(null);
  const indexRef = useRef(currentIndex);
  const countRef = useRef(data.length);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    countRef.current = data.length;
  }, [data.length]);

  // Reels published from the Create tab are prepended, which shifts every row in
  // the list. Line the list back up with the store index when the tab refocuses.
  useFocusEffect(
    useCallback(() => {
      if (itemHeight <= 0) return undefined;
      const timer = setTimeout(() => {
        const index = Math.min(
          indexRef.current,
          Math.max(countRef.current - 1, 0)
        );
        listRef.current?.scrollToIndex({ index, animated: false });
      }, 0);
      return () => clearTimeout(timer);
    }, [itemHeight])
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 120,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const visible = viewableItems.find((item) => item.isViewable);
    if (visible && typeof visible.index === "number") {
      setCurrentIndex(visible.index);
    }
  }).current;

  const getItemLayout = useCallback(
    (_, index) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  const handleChangeTab = useCallback(
    (key) => {
      if (key === activeTab) return;
      Haptics.selectionAsync().catch(() => {});
      setActiveTab(key);
      setCurrentIndex(0);
    },
    [activeTab, setCurrentIndex]
  );

  const handleLike = useCallback((reel) => likeReel(reel.id), [likeReel]);
  const handleSave = useCallback((reel) => saveReel(reel.id), [saveReel]);

  const handleShare = useCallback(async (reel) => {
    try {
      await Share.share({
        message: `${reel.description}\n\n${reel.handle} on Ping`,
      });
    } catch {
      // user dismissed the share sheet
    }
  }, []);

  const handleProfilePress = useCallback(
    (reel) => {
      if (reel.userId) {
        router.push(`/profile/${encodeURIComponent(reel.userId)}`);
      }
    },
    [router]
  );

  const openComments = useCallback((reel) => {
    setCommentReel(reel);
    requestAnimationFrame(() => commentsRef.current?.open());
  }, []);

  const closeComments = useCallback(() => {
    setCommentReel(null);
  }, []);

  return (
    <View style={styles.root}>
      <View
        style={styles.stage}
        onLayout={(e) => setItemHeight(e.nativeEvent.layout.height)}
      >
        {itemHeight > 0 && (
          <FlatList
            ref={listRef}
            key={activeTab}
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ReelItem
                reel={item}
                height={itemHeight}
                isActive={index === currentIndex}
                shouldMount={Math.abs(index - currentIndex) <= 1}
                onLike={handleLike}
                onSave={handleSave}
                onComment={openComments}
                onShare={handleShare}
                onProfilePress={handleProfilePress}
              />
            )}
            pagingEnabled
            snapToInterval={itemHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            showsVerticalScrollIndicator={false}
            getItemLayout={getItemLayout}
            initialScrollIndex={Math.min(currentIndex, Math.max(data.length - 1, 0))}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={[styles.empty, { height: itemHeight }]}>
                <Icon name="reels" size={46} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyTitle}>No reels here yet</Text>
                <Text style={styles.emptyText}>
                  Reels from accounts you follow will show up in this tab.
                </Text>
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => handleChangeTab("forYou")}
                  accessibilityRole="button"
                  accessibilityLabel="Browse For you"
                >
                  <Text style={styles.emptyBtnText}>Browse For you</Text>
                </Pressable>
              </View>
            }
          />
        )}
      </View>

      <ReelsTopBar
        topInset={insets.top}
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
      />

      <ReelCommentsSheet
        sheetRef={commentsRef}
        reel={commentReel}
        onClose={closeComments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  stage: { flex: 1, backgroundColor: "#000000" },
  listContent: { backgroundColor: "#000000" },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  // Pill switch: one rounded container, the active side becomes a white thumb.
  segments: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 2,
    padding: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  segment: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 999,
  },
  segmentActive: { backgroundColor: "#FFFFFF" },
  segmentPressed: { opacity: 0.85 },
  segmentText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  segmentTextActive: { color: "#111114", fontWeight: "700" },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  emptyText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.primary,
  },
  emptyBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  sheetEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 10,
  },
  sheetList: {
    flex: 1,
    minHeight: 0,
  },
  sheetListContent: {
    paddingBottom: 16,
  },
  sheetEmptyText: {
    color: palette.muted,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 240,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  commentBody: { flex: 1, minWidth: 0 },
  commentHead: { flexDirection: "row", alignItems: "center", gap: 5 },
  commentUser: { fontSize: 14, fontWeight: "700", color: palette.ink },
  commentTime: { fontSize: 12, color: palette.muted, marginLeft: 2 },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink,
    marginTop: 3,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 6,
  },
  commentAction: { fontSize: 12, color: palette.muted, fontWeight: "600" },
  commentLikeRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: palette.card,
  },
  commentInputContainer: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 21,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: palette.ink,
    paddingVertical: 14,
    minHeight: 42,
    maxHeight: 110,
  },
  commentSend: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  commentSendDisabled: { backgroundColor: palette.line },
});
