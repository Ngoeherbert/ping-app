import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { palette } from "../constants/colors";
import { radius } from "../constants/radius";
import { shadows } from "../constants/shadows";
import Avatar from "../components/ui/Avatar";
import Icon from "../components/ui/Icon";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import { useStoriesData } from "../hooks/useStoriesData";
import { USER_PROFILES, MY_PROFILE, MY_USER_ID } from "../lib/mockData";
import { storyKind } from "../lib/stores/storyStore";

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

function StoryThumb({ story, style }) {
  const kind = storyKind(story);
  const remote = typeof story.cover === "string" && /^https?:\/\//i.test(story.cover);
  const cover = kind === "image" || (kind === "video" && remote) ? story.cover : null;
  const icon = kind === "video" ? "play" : kind === "link" ? "link" : kind === "audio" ? "mic" : "image";
  return (
    <View style={[styles.thumb, style, kind === "text" && { backgroundColor: story.bg ?? "#111B21" }]}>
      {cover ? (
        <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.thumbFallback, kind === "text" && { backgroundColor: story.bg ?? "#111B21" }]}>
          {kind === "text" ? (
            <Text style={[styles.coverGlyph, { color: story.textColor ?? "#FFFFFF" }]}>Aa</Text>
          ) : (
            <Icon name={icon} size={26} color={kind === "audio" ? "#00A884" : "#00A884"} />
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
  const { myStories, onDeleteStory, onUpdateStory, storyViewsCount } = useStoriesData();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [viewersStory, setViewersStory] = useState(null);

  const stories = useMemo(() => {
    if (!myStories) return [];
    return [...myStories].sort((a, b) => {
      if (a.userId === MY_USER_ID && b.userId !== MY_USER_ID) return -1;
      if (a.userId !== MY_USER_ID && b.userId === MY_USER_ID) return 1;
      return 0;
    });
  }, [myStories]);

  const viewers = viewersStory?.views ?? [];

  const openViewers = useCallback((story) => {
    setViewersStory(story);
  }, []);

  const closeViewers = useCallback(() => setViewersStory(null), []);

  const startEdit = useCallback((story) => {
    setEditing(story.id);
    setDraft(story.caption ?? "");
  }, []);

  const saveEdit = useCallback(() => {
    if (!editing) return;
    const text = draft.trim();
    onUpdateStory(editing, { caption: text });
    if (text) {
      const story = myStories?.find((s) => s.id === editing);
      if (story?.kind === "text") onUpdateStory(editing, { text });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setEditing(null);
    setDraft("");
  }, [editing, draft, onUpdateStory, myStories]);

  const deleteStory = useCallback(
    (story) => {
      Alert.alert("Delete story", "This can't be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onDeleteStory(story.id);
            if (editing === story.id) {
              setEditing(null);
              setDraft("");
            }
          },
        },
      ]);
    },
    [onDeleteStory, editing]
  );

  const goCreate = useCallback(() => {
    router.navigate("/story-create");
  }, [router]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Back">
          <Icon name="back" size={24} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My stories</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Pressable onPress={goCreate} style={styles.addCard} accessibilityRole="button" accessibilityLabel="Add a new story">
          <View>
            <Avatar uri={myStories?.[0]?.avatar ?? MY_PROFILE.avatar} name="You" size={64} />
            <View style={styles.addPlus}>
              <View style={styles.addBarH} />
              <View style={styles.addBarV} />
            </View>
          </View>
          <Text style={styles.addText}>Add new story</Text>
        </Pressable>

        {stories.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="image" size={48} color={palette.muted} />
            <Text style={styles.emptyText}>You haven&apos;t posted any stories yet.</Text>
            <Text style={styles.emptySub}>Tap &quot;{`Add new story`}&quot; to get started.</Text>
          </View>
        ) : (
          stories.map((story) => (
            <View key={story.id} style={[styles.storyRow, shadows.card]}>
              <StoryThumb story={story} />
              <View style={styles.storyInfo}>
                <View style={styles.storyKindRow}>
                  <Text style={styles.storyKind}>{kindLabel(storyKind(story))}</Text>
                  <Text style={styles.storyCaption} numberOfLines={editing === story.id ? 4 : 2}>
                    {story.caption || story.text || "(no caption)"}
                  </Text>
                </View>
                {editing === story.id ? (
                  <View style={styles.editRow}>
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      placeholder="Caption"
                      placeholderTextColor={palette.muted}
                      style={styles.captionInput}
                      autoFocus
                      maxLength={300}
                      returnKeyType="done"
                      onSubmitEditing={saveEdit}
                    />
                    <Pressable onPress={saveEdit} style={styles.saveBtn} accessibilityRole="button" accessibilityLabel="Save">
                      <Icon name="check" size={18} color={palette.primary} />
                    </Pressable>
                    <Pressable onPress={() => { setEditing(null); setDraft(""); }} style={styles.saveBtn} accessibilityRole="button" accessibilityLabel="Cancel">
                      <Icon name="close" size={18} color={palette.muted} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => openViewers(story)} style={styles.viewsRow} accessibilityRole="button" accessibilityLabel={`View ${storyViewsCount(story)} viewers`}>
                    <View style={styles.viewsDot}>
                      <Icon name="eye" size={12} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <Text style={styles.viewsLabel}>{storyViewsCount(story)} {storyViewsCount(story) === 1 ? "viewer" : "views"}</Text>
                  </Pressable>
                )}
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => startEdit(story)} hitSlop={10} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Edit story">
                  <Icon name="edit" size={20} color={palette.ink} />
                </Pressable>
                <Pressable onPress={() => deleteStory(story)} hitSlop={10} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Delete story">
                  <Icon name="delete" size={20} color={palette.danger} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <ViewersModal visible={!!viewersStory} onClose={closeViewers} story={viewersStory} viewers={viewers} />
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

  body: { padding: 16, gap: 14, paddingBottom: Math.max(24, 16) },

  addCard: {
    width: 120,
    height: 156,
    borderRadius: radius.sm,
    backgroundColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    ...shadows.card,
    alignSelf: "flex-start",
  },
  addPlus: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2F80ED",
    borderWidth: 2,
    borderColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  addBarH: { width: 11, height: 2, borderRadius: 1, backgroundColor: "#FFFFFF" },
  addBarV: { position: "absolute", width: 2, height: 11, borderRadius: 1, backgroundColor: "#FFFFFF" },
  addText: { fontSize: 12, color: palette.muted, textAlign: "center" },

  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: palette.card,
    overflow: "hidden",
    padding: 10,
  },
  thumb: { width: 72, height: 72, borderRadius: radius.sm, overflow: "hidden", backgroundColor: palette.line, alignItems: "center", justifyContent: "center" },
  thumbFallback: { alignItems: "center", justifyContent: "center" },
  coverGlyph: { fontSize: 30, fontWeight: "800" },
  kindBadge: { position: "absolute", left: 4, bottom: 4, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  kindBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },

  storyInfo: { flex: 1, minWidth: 0 },
  storyKindRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 2 },
  storyKind: { fontSize: 12, fontWeight: "700", color: palette.muted, textTransform: "capitalize" },
  storyCaption: { fontSize: 14, color: palette.ink, lineHeight: 18 },
  captionInput: { flex: 1, fontSize: 14, color: palette.ink, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: palette.surface, borderRadius: radius.sm, minHeight: 36, textAlignVertical: "top" },

  editRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  saveBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: palette.surface },

  viewsRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  viewsDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#000000", alignItems: "center", justifyContent: "center" },
  viewsLabel: { fontSize: 12, fontWeight: "600", color: palette.muted },

  actions: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: palette.surface },

  emptyState: { alignItems: "center", gap: 10, paddingTop: 24 },
  emptyText: { fontSize: 15, fontWeight: "600", color: palette.ink, textAlign: "center" },
  emptySub: { fontSize: 13, color: palette.muted, textAlign: "center" },

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
