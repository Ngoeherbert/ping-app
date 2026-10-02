import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { palette } from "../constants/colors";
import { radius } from "../constants/radius";
import Avatar from "../components/ui/Avatar";
import Icon from "../components/ui/Icon";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import Card from "../components/ui/Card";
import ActionSheet from "../components/ui/Modal";
import { useStoriesData } from "../hooks/useStoriesData";
import { USER_PROFILES, MY_PROFILE, MY_USER_ID } from "../lib/mockData";
import { storyKind } from "../lib/stores/storyStore";

// Vertical chrome around the list card: the header bar plus the body's
// top/bottom padding. Used to cap the list so it still scrolls when long.
const HEADER_HEIGHT = 46;
const BODY_PADDING = 20;
const MIN_LIST_HEIGHT = 280;

function viewerOf(v) {
  if (!v) return null;
  if (v.userId === MY_USER_ID || v.mine) {
    return { name: "You", handle: MY_PROFILE.handle, avatar: v.avatar ?? MY_PROFILE.avatar, verified: MY_PROFILE.verified, variant: MY_PROFILE.verifiedVariant, time: v.time ?? "now" };
  }
  const p = USER_PROFILES[String(v.userId)];
  if (p) {
    return { name: p.name, handle: p.handle, avatar: v.avatar ?? p.avatar, verified: p.verified, variant: p.verifiedVariant, time: v.time ?? "2h" };
  }
  return { name: v.name ?? "Someone", handle: v.handle ?? "", avatar: v.avatar ?? null, verified: false, variant: "blue", time: v.time ?? "now" };
}

function kindLabel(kind) {
  return kind === "video" ? "Video" : kind === "text" ? "Text" : kind === "link" ? "Link" : kind === "audio" ? "Audio" : "Photo";
}

/** Human caption for a story, falling back to its text payload then a placeholder. */
function plainCaption(story) {
  const text = story?.caption?.trim() || story?.text?.trim();
  return text || "(no caption)";
}

/** Display timestamp for a story; created stories stamp "Just now". */
function storyTime(story) {
  return story?.time ?? "Just now";
}

function StoryThumb({ story, size = 72, circular = false }) {
  const kind = storyKind(story);
  const remote = typeof story.cover === "string" && /^https?:\/\//i.test(story.cover);
  const cover = kind === "image" || (kind === "video" && remote) ? story.cover : null;
  const icon = kind === "video" ? "play" : kind === "link" ? "link" : kind === "audio" ? "mic" : "image";
  return (
    <View
      style={[
        styles.thumb,
        { width: size, height: size, borderRadius: circular ? size / 2 : radius.sm },
        kind === "text" && { backgroundColor: story.bg ?? "#111B21" },
      ]}
    >
      {cover ? (
        <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.thumbFallback, kind === "text" && { backgroundColor: story.bg ?? "#111B21" }]}>
          {kind === "text" ? (
            <Text style={[styles.coverGlyph, { color: story.textColor ?? "#FFFFFF" }]}>Aa</Text>
          ) : (
            <Icon name={icon} size={Math.round(size * 0.34)} color="#00A884" />
          )}
        </View>
      )}
      <View style={styles.kindBadge}>
        <Text style={styles.kindBadgeText}>{kindLabel(kind)}</Text>
      </View>
    </View>
  );
}

function ViewersModal({ visible, onClose, story, viewers }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.viewersSheet}>
        <View style={styles.viewersHandle} />
        <View style={styles.viewersHeader}>
          <Text style={styles.viewersTitle} numberOfLines={1}>
            {story?.caption?.trim() ? story.caption : kindLabel(storyKind(story))}
          </Text>
          <Text style={styles.viewersCount}>{viewers.length} {viewers.length === 1 ? "viewer" : "views"}</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.viewersClose} accessibilityRole="button" accessibilityLabel="Close viewers">
            <Icon name="close" size={22} color={palette.ink} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.viewersList}>
          {viewers.map((v) => {
            const p = viewerOf(v);
            return (
              <View key={v.userId ?? v.time} style={styles.viewerRow}>
                <Avatar uri={p.avatar} name={p.name} size={44} />
                <View style={styles.viewerInfo}>
                  <View style={styles.viewerNameRow}>
                    <Text style={styles.viewerName} numberOfLines={1}>{p.name}</Text>
                    {p.verified ? <VerifiedBadge variant={p.variant} size={15} inline style={{ marginLeft: 4 }} /> : null}
                  </View>
                  <Text style={styles.viewerHandle} numberOfLines={1}>{p.handle}</Text>
                </View>
                <Text style={styles.viewerTime}>{p.time}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function MyStoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { myStories, onOpenStory, onDeleteStory, onUpdateStory, storyViewsCount } = useStoriesData();
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [viewersStory, setViewersStory] = useState(null);
  const [actionsStory, setActionsStory] = useState(null);

  // The card grows with its stories instead of stretching to fill the screen,
  // but it never grows past the space available, so long lists still scroll.
  const listMaxHeight = Math.max(
    MIN_LIST_HEIGHT,
    windowHeight - insets.top - insets.bottom - HEADER_HEIGHT - BODY_PADDING
  );

  const stories = useMemo(() => myStories ?? [], [myStories]);
  const viewers = viewersStory?.views ?? [];

  const openViewers = useCallback((story) => {
    setActionsStory(null);
    setViewersStory(story);
  }, []);

  const closeViewers = useCallback(() => setViewersStory(null), []);

  const openActions = useCallback((story) => {
    Haptics.selectionAsync().catch(() => {});
    setActionsStory(story);
  }, []);

  const closeActions = useCallback(() => setActionsStory(null), []);

  const setDraftFor = useCallback((id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  }, []);

  const clearDraft = useCallback((id) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const saveCaption = useCallback(
    (story) => {
      const text = (drafts[story.id] ?? plainCaption(story)).trim();
      onUpdateStory(story.id, { caption: text });
      if (storyKind(story) === "text") onUpdateStory(story.id, { text });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      clearDraft(story.id);
    },
    [drafts, onUpdateStory, clearDraft]
  );

  const toggleEdit = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setEditMode((value) => !value);
    setDrafts({});
  }, []);

  const deleteStory = useCallback(
    (story) => {
      setActionsStory(null);
      Alert.alert("Delete story", "This can't be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onDeleteStory(story.id);
            clearDraft(story.id);
          },
        },
      ]);
    },
    [onDeleteStory, clearDraft]
  );

  const goCreate = useCallback(() => {
    router.navigate("/story-create");
  }, [router]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  const renderStory = useCallback(
    ({ item: story }) => (
      <View style={styles.storyRow}>
        <Pressable
          onPress={() => {
            // While editing, taps belong to the caption field, not the viewer.
            if (editMode) return;
            Haptics.selectionAsync().catch(() => {});
            onOpenStory(story);
          }}
          style={styles.storyMain}
          accessibilityRole="button"
          accessibilityLabel={`Open ${kindLabel(storyKind(story))} story`}
        >
          <StoryThumb story={story} size={54} circular />
          <View style={styles.storyInfo}>
            <View style={styles.storyTitleRow}>
              {editMode ? (
                <TextInput
                  value={drafts[story.id] ?? plainCaption(story)}
                  onChangeText={(value) => setDraftFor(story.id, value)}
                  placeholder="Caption"
                  placeholderTextColor={palette.muted}
                  style={styles.captionInput}
                  maxLength={300}
                  returnKeyType="done"
                  onSubmitEditing={() => saveCaption(story)}
                  accessibilityLabel="Story caption"
                />
              ) : (
                <View
                  style={styles.viewsRow}
                  accessibilityLabel={`${storyViewsCount(story)} views`}
                >
                  <Text style={styles.viewsCount}>{storyViewsCount(story)}</Text>
                  <Text style={styles.viewsText}>
                    {storyViewsCount(story) === 1 ? "view" : "views"}
                  </Text>
                </View>
              )}
            </View>
            {editMode ? (
              <View style={styles.editActions}>
                <Pressable
                  onPress={() => saveCaption(story)}
                  style={styles.saveBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Save caption"
                >
                  <Icon name="check" size={16} color={palette.primary} />
                </Pressable>
                <Pressable
                  onPress={() => clearDraft(story.id)}
                  style={styles.saveBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Reset caption"
                >
                  <Icon name="close" size={16} color={palette.muted} />
                </Pressable>
              </View>
            ) : (
              <Text style={styles.storyTime}>{storyTime(story)}</Text>
            )}
          </View>
        </Pressable>
        <Pressable
          onPress={() => openActions(story)}
          hitSlop={8}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Icon name="more" size={20} color={palette.muted} strokeWidth={1.6} />
        </Pressable>
      </View>
    ),
    [drafts, editMode, onOpenStory, openActions, saveCaption, setDraftFor, clearDraft, storyViewsCount]
  );

  const listEmpty = (
    <View style={styles.emptyState}>
      <Icon name="image" size={44} color={palette.muted} />
      <Text style={styles.emptyText}>You haven&apos;t posted any stories yet.</Text>
      <Text style={styles.emptySub}>Tap &quot;Add story&quot; to get started.</Text>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Back">
          <Icon name="back" size={24} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My stories</Text>
        <Pressable
          onPress={editMode ? toggleEdit : goCreate}
          style={styles.headerAction}
          accessibilityRole="button"
          accessibilityLabel={editMode ? "Done editing" : "Add a new story"}
        >
          {editMode ? (
            <Text style={styles.headerActionText}>Done</Text>
          ) : (
            <View style={styles.headerPlusCircle}>
              <View style={styles.addBarH} />
              <View style={styles.addBarV} />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.body}>
        <Card padding={0}>
          <FlatList
            data={stories}
            style={[styles.list, { maxHeight: listMaxHeight }]}
            keyExtractor={(item) => item.id}
            renderItem={renderStory}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={listEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </Card>
      </View>

      <ViewersModal visible={!!viewersStory} onClose={closeViewers} story={viewersStory} viewers={viewers} />

      <ActionSheet visible={!!actionsStory} onRequestClose={closeActions}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeActions}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={styles.actionsCard}>
          <View style={styles.actionsHandle} />
          <Text style={styles.actionsTitle} numberOfLines={1}>{plainCaption(actionsStory)}</Text>
          <Pressable
            onPress={() => openViewers(actionsStory)}
            style={styles.actionRow}
            accessibilityRole="button"
            accessibilityLabel="View viewers"
          >
            <Icon name="eye" size={20} color={palette.ink} />
            <Text style={styles.actionRowText}>View viewers</Text>
            <Text style={styles.actionRowMeta}>{storyViewsCount(actionsStory)}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setActionsStory(null);
              setEditMode(true);
            }}
            style={styles.actionRow}
            accessibilityRole="button"
            accessibilityLabel="Edit caption"
          >
            <Icon name="edit" size={20} color={palette.ink} />
            <Text style={styles.actionRowText}>Edit caption</Text>
          </Pressable>
          <Pressable
            onPress={() => deleteStory(actionsStory)}
            style={styles.actionRow}
            accessibilityRole="button"
            accessibilityLabel="Delete story"
          >
            <Icon name="delete" size={20} color={palette.danger} />
            <Text style={[styles.actionRowText, { color: palette.danger }]}>Delete story</Text>
          </Pressable>
        </View>
      </ActionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 46,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 19, fontWeight: "800", color: palette.ink, flex: 1, textAlign: "center" },
  headerAction: { minWidth: 40, height: 40, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
  headerActionText: { fontSize: 15, fontWeight: "700", color: palette.primary },
  headerPlusCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.primary, alignItems: "center", justifyContent: "center" },

  body: { flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  list: { flexGrow: 0 },
  listContent: { paddingVertical: 4 },

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: palette.line, marginLeft: 82 },

  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: palette.card,
  },
  // Tappable content area (thumbnail + meta). Kept separate from the row so the
  // "more" button is a sibling rather than a nested pressable.
  storyMain: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { backgroundColor: palette.line, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbFallback: { alignItems: "center", justifyContent: "center" },
  coverGlyph: { fontSize: 22, fontWeight: "800" },
  kindBadge: { position: "absolute", left: 2, bottom: 2, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 999 },
  kindBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "700" },

  storyInfo: { flex: 1, minWidth: 0, gap: 5 },
  storyTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  storyTime: { fontSize: 12, color: palette.muted },
  captionInput: { flex: 1, minWidth: 0, fontSize: 14, color: palette.ink, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: radius.sm, minHeight: 36 },

  viewsRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  viewsCount: { fontSize: 15, fontWeight: "800", color: palette.ink },
  viewsText: { fontSize: 14, fontWeight: "600", color: palette.muted },

  editActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  saveBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: palette.surface },

  moreBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  addBarH: { position: "absolute", width: 15, height: 2.5, borderRadius: 1, backgroundColor: "#FFFFFF" },
  addBarV: { position: "absolute", width: 2.5, height: 15, borderRadius: 1, backgroundColor: "#FFFFFF" },

  emptyState: { alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 40, paddingHorizontal: 24 },
  emptyText: { fontSize: 15, fontWeight: "600", color: palette.ink, textAlign: "center" },
  emptySub: { fontSize: 13, color: palette.muted, textAlign: "center" },

  actionsCard: { backgroundColor: palette.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 8, paddingBottom: 24, paddingHorizontal: 8 },
  actionsHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: palette.line, alignSelf: "center", marginBottom: 8 },
  actionsTitle: { fontSize: 15, fontWeight: "700", color: palette.ink, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 12 },
  actionRowText: { flex: 1, fontSize: 15, fontWeight: "600", color: palette.ink },
  actionRowMeta: { fontSize: 14, color: palette.muted },

  viewersSheet: { flex: 1, backgroundColor: palette.background, paddingHorizontal: 16 },
  viewersHandle: { width: 32, height: 4, borderRadius: 2, backgroundColor: palette.line, alignSelf: "center", marginTop: 8, marginBottom: 8 },
  viewersHeader: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  viewersTitle: { fontSize: 17, fontWeight: "700", color: palette.ink, maxWidth: "70%" },
  viewersCount: { fontSize: 14, color: palette.muted, marginTop: 4 },
  viewersClose: { position: "absolute", right: 0, top: 6, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  viewersList: { paddingVertical: 8, gap: 6 },
  viewerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  viewerInfo: { flex: 1, minWidth: 0 },
  viewerNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewerName: { fontSize: 14, fontWeight: "700", color: palette.ink },
  viewerHandle: { fontSize: 12, color: palette.muted },
  viewerTime: { fontSize: 12, color: palette.muted, textAlign: "right" },
});
