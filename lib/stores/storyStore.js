import { create } from "zustand";
import { useMemo } from "react";
import { STORIES, MY_PROFILE, MY_AVATAR, MY_USER_ID, getStoryViewers } from "../mockData";

export const STORY_KINDS = ["image", "video", "text", "link", "audio"];

/** Resolves a story's kind. `kind` is this project's convention (set by createStory). */
export function storyKind(story) {
  const k = story?.kind ?? story?.type;
  if (STORY_KINDS.includes(k)) return k;
  if (k == null) {
    // Legacy stories without an explicit kind — infer from payload shape.
    if (story?.text || story?.bg) return "text";
    if (story?.audioUri) return "audio";
    if (story?.videoUri) return "video";
    if (story?.link && !story?.cover && !story?.uri) return "link";
  }
  return "image";
}

/**
 * Single normalization boundary: every story entering the store gets an
 * explicit `kind` plus kind-consistent media fields, so consumers (viewer,
 * tiles, notifications) never need database-specific conditions.
 */
export function normalizeStory(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const kind = storyKind(raw);
  const s = { ...raw, kind };
  if (kind === "video") {
    if (!s.videoUri) s.videoUri = s.uri ?? null;
    // A local media file is not an image thumbnail — don't let naive
    // consumers try to render it as one.
    if (typeof s.cover === "string" && !/^https?:\/\//i.test(s.cover)) s.cover = null;
  }
  if (kind === "audio") {
    if (!s.audioUri) s.audioUri = s.uri ?? null;
    s.cover = null;
  }
  if (kind === "link" && !s.url) s.url = s.link ?? null;
  if (kind === "text") {
    if (s.text == null) s.text = s.caption ?? "";
    if (s.bg == null) s.bg = s.background ?? null;
    s.cover = null;
  }
  // Viewers live by story id in mockData; attach them once so consumers never
  // need to look them up separately. Created stories simply have none.
  if (!Array.isArray(s.views)) s.views = getStoryViewers(s.id);
  return s;
}

/** Total viewer count for a story (works for both seeded and created stories). */
export function storyViewsCount(story) {
  return story?.views?.length ?? 0;
}

/**
 * User ids in first-appearance order — the cross-user navigation order.
 * Kept algorithmically identical to the grouping order used by StoriesRow,
 * so "next user" in the viewer is always "next tile" in the story row.
 */
export function storyUserOrder(stories) {
  const out = [];
  const seen = new Set();
  for (const s of stories ?? []) {
    if (!s) continue;
    const key = String(s.userId ?? "unknown");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s.userId);
  }
  return out;
}

/**
 * Target of a USER-LEVEL move: the next user's FIRST story (dir "next") or the
 * previous user's LAST story (dir "prev"). Returns `{ story, index }`, or null
 * when there is no user in that direction. Used by the swipe-to-switch gesture
 * in the viewer and by the tap boundary handling in next/prevStory.
 */
export function userNeighbor(stories, userId, dir) {
  if (userId == null) return null;
  const order = storyUserOrder(stories);
  const ui = order.findIndex((u) => String(u) === String(userId));
  if (ui < 0) return null;
  const nbId = dir === "prev" ? order[ui - 1] : order[ui + 1];
  if (nbId == null) return null;
  const group = stories.filter((s) => String(s.userId) === String(nbId));
  if (group.length === 0) return null;
  const index = dir === "prev" ? group.length - 1 : 0;
  return { story: group[index], index };
}

const useStoryStoreBase = create((set) => ({
  stories: STORIES.map(normalizeStory),
  myProfile: MY_PROFILE,
  // --- Active viewing session: scoped to ONE user -------------------------
  // `activeUserId` is the owner of the open session; `activeStoryIndex` is an
  // index into THAT user's stories only, so sequences never bleed across users.
  activeUserId: null,
  activeStoryIndex: null,
  jumpDir: null, // "next" | "prev" for a WIPE gesture jump; null for tap moves
  startingStory: false,

  openStorySession: (story) =>
    set((state) => {
      if (!story) return { activeUserId: null, activeStoryIndex: null };
      const group = state.stories.filter((s) => s.userId === story.userId);
      if (group.length === 0) return { activeUserId: null, activeStoryIndex: null };
      const idx = group.findIndex((s) => s.id === story.id);
      return { activeUserId: story.userId, activeStoryIndex: idx === -1 ? 0 : idx };
    }),

  openStoryAt: (index) =>
    set((state) => {
      const target = state.stories[index];
      if (!target) return { activeUserId: null, activeStoryIndex: null };
      const group = state.stories.filter((s) => s.userId === target.userId);
      const idx = group.findIndex((s) => s.id === target.id);
      return { activeUserId: target.userId, activeStoryIndex: idx === -1 ? 0 : idx };
    }),

  closeStory: () => set({ activeUserId: null, activeStoryIndex: null }),

  // --- STORY-LEVEL navigation: tap LEFT / tap RIGHT -----------------------
  // Stays inside the open user's sequence. At the sequence boundary the tap
  // continues with the neighbouring user but WITHOUT `jumpDir`, so the viewer
  // never plays the cubic wipe for a tap. The last user's last story closes.
  nextStory: () =>
    set((state) => {
      if (state.activeUserId == null || state.activeStoryIndex == null) return state;
      const group = state.stories.filter((s) => s.userId === state.activeUserId);
      const current = group.length ? Math.min(state.activeStoryIndex, group.length - 1) : -1;
      if (current + 1 < group.length) return { activeStoryIndex: current + 1 };
      const nb = userNeighbor(state.stories, state.activeUserId, "next");
      if (!nb) return { activeUserId: null, activeStoryIndex: null, jumpDir: null };
      return { activeUserId: nb.story.userId, activeStoryIndex: nb.index, jumpDir: null };
    }),

  prevStory: () =>
    set((state) => {
      if (state.activeUserId == null || state.activeStoryIndex == null) return state;
      const group = state.stories.filter((s) => s.userId === state.activeUserId);
      const current = group.length ? Math.min(state.activeStoryIndex, group.length - 1) : -1;
      if (current > 0) return { activeStoryIndex: current - 1 };
      const nb = userNeighbor(state.stories, state.activeUserId, "prev");
      // First story of the first user -> stay put; the viewer restarts it.
      if (!nb) return { activeStoryIndex: 0 };
      return { activeUserId: nb.story.userId, activeStoryIndex: nb.index, jumpDir: null };
    }),

  // --- USER-LEVEL navigation: the dedicated cubic-wipe swipe gesture -------
  // These are the only moves that set `jumpDir`, which is what marks a
  // user-to-user transition (and mirrors the swipe's direction).
  nextUser: () =>
    set((state) => {
      const nb = userNeighbor(state.stories, state.activeUserId, "next");
      if (!nb) return { jumpDir: null }; // nothing to the right -> the gesture bounces back
      return { activeUserId: nb.story.userId, activeStoryIndex: nb.index, jumpDir: "next" };
    }),

  prevUser: () =>
    set((state) => {
      const nb = userNeighbor(state.stories, state.activeUserId, "prev");
      if (!nb) return { jumpDir: null }; // nothing to the left -> the gesture bounces back
      return { activeUserId: nb.story.userId, activeStoryIndex: nb.index, jumpDir: "prev" };
    }),

  markSeen: (id) =>
    set((state) => ({
      stories: state.stories.map((s) => (s.id === id ? { ...s, seen: true } : s)),
    })),

  // --- My Stories: management inside the My Stories screen ---
  deleteStory: (id) =>
    set((state) => {
      const group = state.stories.filter((s) => s.userId === state.activeUserId);
      const active =
        state.activeUserId != null && state.activeStoryIndex != null
          ? group[Math.min(state.activeStoryIndex, group.length - 1)]
          : null;
      const closing = active?.id === id;
      return {
        stories: state.stories.filter((s) => s.id !== id),
        activeUserId: closing ? null : state.activeUserId,
        activeStoryIndex: closing ? null : state.activeStoryIndex,
        jumpDir: null,
      };
    }),

  updateStory: (id, updates) =>
    set((state) => ({
      stories: state.stories.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
}));

export const { getState: getStoryState, setState: setStoryState } = useStoryStoreBase;

export function useStoryStore() {
  return useStoryStoreBase(getStoryState);
}

export function useStories() {
  return useStoryStoreBase((state) => state.stories);
}

export function useMyProfile() {
  return useStoryStoreBase((state) => state.myProfile);
}

export function useActiveUserId() {
  return useStoryStoreBase((state) => state.activeUserId);
}

export function useActiveStoryIndex() {
  return useStoryStoreBase((state) => state.activeStoryIndex);
}

/** Direction of the most recent cross-user jump ("next" | "prev" | null). */
export function useJumpDir() {
  return useStoryStoreBase((state) => state.jumpDir);
}

/** The currently open session's current story, resolved live from the store. */
export function useActiveStory() {
  return useStoryStoreBase((state) => {
    if (state.activeUserId == null || state.activeStoryIndex == null) return null;
    const group = state.stories.filter((s) => s.userId === state.activeUserId);
    if (group.length === 0) return null;
    return group[Math.min(state.activeStoryIndex, group.length - 1)] ?? null;
  });
}

/**
 * Opens an isolated viewing session containing only the tapped story owner's
 * stories, starting at the tapped story. Other users' stories are never part
 * of the sequence.
 */
export const openStory = (story) => {
  if (!story) return;
  getStoryState().openStorySession(story);
};

export const openStoryAt = (index) => getStoryState().openStoryAt(index);
export const closeStory = () => getStoryState().closeStory();
export const nextStory = () => getStoryState().nextStory();
export const prevStory = () => getStoryState().prevStory();
export const nextUser = () => getStoryState().nextUser();
export const prevUser = () => getStoryState().prevUser();
export const markSeen = (id) => getStoryState().markSeen(id);
export const deleteStory = (id) => getStoryState().deleteStory(id);
export const updateStory = (id, updates) => getStoryState().updateStory(id, updates);

export function useMyStories() {
  const stories = useStoryStoreBase((state) => state.stories);
  return useMemo(() => stories.filter((s) => s.userId === MY_USER_ID), [stories]);
}

/** Viewers list for a given story id, pulled from the store's normalized `views`. */
export const useStoryViewers = (storyId) =>
  useStoryStoreBase((state) => getStoryViewers(storyId));

export const startStory = () => {
  setStoryState({ startingStory: true });
  setTimeout(() => setStoryState({ startingStory: false }), 500);
};

/**
 * Publishes a story owned by the signed-in user. It lands at the front of the
 * story row on Home so the composer has somewhere visible to send it.
 */
export const createStory = ({ cover, kind = "image", uri, videoUri, caption = "", link = null, bg = null, font = "regular", audioUri = null, duration = 0 }) => {
  const mediaUri = videoUri ?? uri ?? cover;
  const story = {
    id: `story-me-${Date.now()}`,
    userId: MY_USER_ID,
    name: MY_PROFILE.name,
    avatar: MY_AVATAR,
    cover: cover ?? mediaUri,
    kind,
    uri: mediaUri,
    videoUri: kind === "video" ? mediaUri : undefined,
    caption,
    link,
    bg,
    font,
    audioUri,
    duration,
    seen: false,
    mine: true,
    views: [],
  };
  setStoryState((state) => ({ stories: [normalizeStory(story), ...state.stories] }));
  return story;
};
