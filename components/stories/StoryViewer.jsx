import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Modal, PanResponder, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import StoryContent from "./StoryContent";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import VerifiedBadge from "../ui/VerifiedBadge";
import { USER_PROFILES, MY_USER_ID, MY_PROFILE } from "../../lib/mockData";
import { useActiveStoryIndex, useActiveUserId, useStories, closeStory, nextStory, nextUser, prevStory, prevUser, markSeen, storyKind, storyUserOrder, userNeighbor } from "../../lib/stores/storyStore";

const DURATION = 5000;
const SCREEN_W = Dimensions.get("window").width;
const SWIPE_ACTIVATE = 16; // px of horizontal drag before the user swipe takes over
const SWIPE_COMMIT = 0.22; // fraction of the screen that commits the switch

function authorOf(story) {
  if (!story) return { name: "?", avatar: null };
  if (story.userId === MY_USER_ID || story.mine)
    return { name: "Your story", handle: MY_PROFILE.handle, avatar: story.avatar ?? MY_PROFILE.avatar, time: "now" };
  const p = USER_PROFILES[String(story.userId)];
  if (!p) return { name: story.name ?? "Unknown", avatar: story.avatar ?? null, time: "2h" };
  return { name: p.name, handle: p.handle, avatar: story.avatar ?? p.avatar, verified: p.verified, variant: p.verifiedVariant, time: story.time ?? "2h" };
}
export default function StoryViewer() {
  const stories = useStories();
  const activeUserId = useActiveUserId();
  const storeIndex = useActiveStoryIndex();
  // The open session contains ONLY the selected user's stories. It is derived
  // live from the store, so deletions/dynamic loads flow in while the index
  // stays scoped to this user's sequence.
  const session = useMemo(
    () => (activeUserId == null ? null : stories.filter((s) => s.userId === activeUserId)),
    [activeUserId, stories]
  );
  const activeIndex =
    session != null && storeIndex != null && session.length > 0
      ? Math.min(storeIndex, session.length - 1)
      : null;
  const insets = useSafeAreaInsets();
  const visible = activeIndex != null;
  const story = activeIndex != null ? session[activeIndex] : null;
  const kind = story ? storyKind(story) : null;
  // image/text/link use the fixed 5s story timer; video/audio advance with playback.
  const timed = kind == null || kind === "image" || kind === "text" || kind === "link";
  // Two-level navigation: stories within the current user, users within this order.
  const userOrder = useMemo(() => storyUserOrder(stories), [stories]);
  const canPrevUser = useMemo(() => {
    if (activeUserId == null) return false;
    const ui = userOrder.findIndex((u) => String(u) === String(activeUserId));
    return ui > 0;
  }, [userOrder, activeUserId]);
  const author = useMemo(() => authorOf(story), [story]);
  const progress = useRef(new Animated.Value(0)).current;
  const anim = useRef(null);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const finishedRef = useRef(null); // id of the last story this viewer finished (double-advance guard)
  const swipeX = useRef(new Animated.Value(0)).current; // drag/commit offset of the wipe layers
  const [stage, setStage] = useState(null); // { dir, phase, outgoing, incoming } during a user swipe
  const stageRef = useRef(null); // latest stage, read by the PanResponder (created once)
  stageRef.current = stage;
  const storyRef = useRef(null); // latest on-screen story, read by the PanResponder
  storyRef.current = story;
  const neighborRef = useRef(() => null); // (dir) => userNeighbor(...) for the current session
  neighborRef.current = (dir) => userNeighbor(stories, activeUserId, dir);
  const commitRef = useRef(null); // assigned below; keeps the responder's closures fresh
  const bounceRef = useRef(null);
  const pauseRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [liked, setLiked] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const finish = useCallback(() => {
    if (story?.id && finishedRef.current === story.id) return; // advance at most once per story
    finishedRef.current = story?.id ?? true;
    if (story?.id) markSeen(story.id);
    nextStory();
  }, [story?.id]);
  // Media (video/audio) drives the same progress bar the image timer uses.
  const onMediaProgress = useCallback((frac) => progress.setValue(frac), [progress]);
  const onMediaEnd = useCallback(() => finish(), [finish]);
  const startAnim = useCallback((from = 0) => {
    anim.current?.stop();
    progress.setValue(from);
    startRef.current = Date.now();
    elapsedRef.current = from * DURATION;
    anim.current = Animated.timing(progress, {
      toValue: 1,
      duration: Math.max(DURATION * (1 - from), 1),
      useNativeDriver: false,
    });
    anim.current.start(({ finished }) => {
      if (finished && !pausedRef.current) finish();
    });
  }, [finish, progress]);
  useEffect(() => {
    if (activeIndex == null) return undefined;
    setReply("");
    setLiked(false);
    setPaused(false);
    elapsedRef.current = 0;
    finishedRef.current = null;
    if (story?.id) markSeen(story.id);
    progress.setValue(0);
    if (timed) startAnim(0); // media-driven types advance via their playback instead
    return () => anim.current?.stop();
  }, [activeIndex, timed, progress, startAnim, story?.id]);
  // If the open user's session becomes empty (e.g. all of their stories were
  // deleted while viewing), close the viewer instead of showing a blank modal.
  useEffect(() => {
    if (session != null && session.length === 0) closeStory();
  }, [session]);
  // A user swipe owns the screen while it runs. When the session closes (X,
  // last story, empty user) drop any staged layers, and once a wipe finishes
  // re-centre the value — the incoming layer is the live layer by then.
  useEffect(() => {
    if (activeUserId == null) setStage(null);
  }, [activeUserId]);
  useEffect(() => {
    if (stage == null) swipeX.setValue(0);
  }, [stage, swipeX]);
  const pause = useCallback(() => {
    anim.current?.stop();
    elapsedRef.current = Math.min(Date.now() - startRef.current + elapsedRef.current, DURATION);
    setPaused(true);
  }, []);
  const resume = useCallback(() => {
    setPaused(false);
    if (!timed) return; // media-driven types resume through their `paused` prop
    startAnim(Math.min(elapsedRef.current / DURATION, 0.999));
  }, [startAnim, timed]);
  const goNext = useCallback(() => {
    if (stageRef.current) return; // a user swipe is running; ignore taps until it settles
    Haptics.selectionAsync().catch(() => {});
    finish();
  }, [finish]);
  const goPrev = useCallback(() => {
    if (stageRef.current) return; // a user swipe is running; ignore taps until it settles
    Haptics.selectionAsync().catch(() => {});
    if (activeIndex == null) return;
    if (activeIndex === 0 && !canPrevUser) {
      // First story of the first user — restart, never an invalid index.
      elapsedRef.current = 0;
      startAnim(0);
      return;
    }
    prevStory(); // within-user step, or the boundary move (no wipe — that is the swipe's)
  }, [activeIndex, canPrevUser, startAnim]);
  // --- Swipe-to-switch-user: the ONLY cubic wipe --------------------------
  // Commit = the swipe passed the threshold: the store moves to the neighbouring
  // user and the layers finish the cubic wipe. Bounce = it did not: spring back.
  const commitSwipe = useCallback(() => {
    const s = stageRef.current;
    if (!s) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (s.dir === "next") nextUser();
    else prevUser();
    setStage((cur) => (cur ? { ...cur, phase: "commit" } : cur));
    Animated.timing(swipeX, {
      toValue: s.dir === "next" ? -SCREEN_W : SCREEN_W,
      duration: 420,
      easing: Easing.bezier(0.65, 0, 0.35, 1), // the cubic curve of the wipe
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setStage(null);
    });
  }, [swipeX]);
  const bounceBack = useCallback(() => {
    Animated.spring(swipeX, { toValue: 0, tension: 220, friction: 26, useNativeDriver: false }).start(
      ({ finished }) => {
        if (!finished) return;
        setStage(null);
        resume(); // aborted gesture: the outgoing story keeps playing where it stopped
      }
    );
  }, [resume, swipeX]);
  commitRef.current = commitSwipe;
  bounceRef.current = bounceBack;
  pauseRef.current = pause;
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // A horizontal drag becomes the user swipe; taps (no travel) and vertical
      // scrolls never claim the responder, so story taps stay untouched.
      onMoveShouldSetPanResponderCapture: (_, g) => {
        if (stageRef.current) return false;
        if (Math.abs(g.dx) < SWIPE_ACTIVATE || Math.abs(g.dx) < Math.abs(g.dy) * 1.4) return false;
        return !!neighborRef.current(g.dx < 0 ? "next" : "prev");
      },
      onPanResponderGrant: (_, g) => {
        const dir = g.dx < 0 ? "next" : "prev";
        const nb = neighborRef.current(dir);
        const cur = storyRef.current;
        if (!nb || !cur) return;
        pauseRef.current?.(); // the outgoing story freezes under the finger
        const st = { dir, phase: "drag", outgoing: cur, incoming: nb.story };
        stageRef.current = st; // usable by the next move event without a re-render
        setStage(st);
      },
      onPanResponderMove: (_, g) => {
        const s = stageRef.current;
        if (!s) return;
        // Follow the finger, clamped to one screen: swiping LEFT pulls in the next
        // user's first story, swiping RIGHT the previous user's last story.
        const x = s.dir === "next" ? Math.min(Math.max(g.dx, -SCREEN_W), 0) : Math.max(Math.min(g.dx, SCREEN_W), 0);
        swipeX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        const s = stageRef.current;
        if (!s) return;
        const far = Math.abs(g.dx) >= SCREEN_W * SWIPE_COMMIT;
        const flick = Math.abs(g.dx) >= 40 && Math.abs(g.vx) >= 0.5 && g.vx * g.dx > 0;
        if (far || flick) commitRef.current?.();
        else bounceRef.current?.();
      },
      onPanResponderTerminate: () => {
        if (stageRef.current) bounceRef.current?.();
      },
    })
  ).current;
  // The incoming layer rides one screen away from the outgoing layer all the way
  // through drag + commit, so the two swap places with a single animated value.
  const stageDir = stage?.dir ?? null;
  const incomingX = useMemo(
    () => Animated.add(swipeX, (stageDir === "prev" ? -1 : 1) * SCREEN_W),
    [stageDir, swipeX]
  );
  // One or two story layers, keyed by story id: the incoming layer is the SAME
  // element throughout the wipe (React keeps it by key), so its media is never
  // torn down and restarted when the transition ends.
  const layers = useMemo(() => {
    if (stage) {
      return [
        { story: stage.outgoing, kind: storyKind(stage.outgoing), role: "outgoing", paused: true },
        {
          story: stage.incoming,
          kind: storyKind(stage.incoming),
          role: "incoming",
          paused: stage.phase === "commit" ? paused : true,
        },
      ];
    }
    return story ? [{ story, kind, role: "live", paused }] : [];
  }, [stage, story, kind, paused]);
  const handleClose = useCallback(() => {
    anim.current?.stop();
    setPaused(false);
    closeStory();
  }, []);
  if (!visible || !story) return null;
  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent presentationStyle="fullScreen" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.contentClip}>
          {layers.map((l) => (
            <Animated.View
              key={l.story.id}
              style={[
                StyleSheet.absoluteFill,
                l.role === "outgoing" && { transform: [{ translateX: swipeX }] },
                l.role === "incoming" && { transform: [{ translateX: incomingX }] },
              ]}
            >
              <StoryContent
                story={l.story}
                kind={l.kind}
                paused={l.paused}
                author={authorOf(l.story)}
                onProgress={l.role === "outgoing" ? undefined : onMediaProgress}
                onFinish={l.role === "outgoing" ? undefined : onMediaEnd}
              />
            </Animated.View>
          ))}
        </View>
        <View style={styles.topScrim} pointerEvents="none" />
        <View style={styles.bottomScrim} pointerEvents="none" />
        <View style={styles.tapRow} {...pan.panHandlers}>
          <Pressable style={styles.tapLeft} onPress={goPrev} onLongPress={pause} onPressOut={() => paused && !stageRef.current && resume()} delayLongPress={220} accessibilityRole="button" accessibilityLabel="Previous story" />
          <Pressable style={styles.tapRight} onPress={goNext} onLongPress={pause} onPressOut={() => paused && !stageRef.current && resume()} delayLongPress={220} accessibilityRole="button" accessibilityLabel="Next story" />
        </View>
        <View style={[styles.chrome, { paddingTop: Math.max(insets.top, 8) + 6 }]}>
          <View style={styles.progressRow}>
            {(session ?? []).map((s, i) => (
              <View key={s.id} style={styles.track}>
                {i < activeIndex ? <View style={[styles.fill, { width: "100%" }]} /> : i > activeIndex ? <View style={[styles.fill, { width: "0%" }]} /> : (
                  <Animated.View style={[styles.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
                )}
              </View>
            ))}
          </View>
          <View style={styles.authorRow}>
            <Avatar uri={author.avatar} name={author.name} size={36} />
            <View style={styles.authorText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{author.name}</Text>
                {author.verified ? <VerifiedBadge variant={author.variant} size={15} inline style={{ marginLeft: 4 }} /> : null}
                <Text style={styles.time}>  ·  {author.time ?? "2h"}</Text>
              </View>
              {!!author.handle && <Text style={styles.handle} numberOfLines={1}>{author.handle}</Text>}
            </View>
            <Pressable onPress={handleClose} hitSlop={10} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close story viewer">
              <Icon name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
        <View style={[styles.replyBar, { paddingBottom: Math.max(insets.bottom, 10) + 6 }]}>
          <View style={styles.inputWrap}>
            <TextInput value={reply} onChangeText={setReply} placeholder="Reply..." placeholderTextColor="rgba(255,255,255,0.7)" style={styles.input} onFocus={pause} onBlur={resume} returnKeyType="send" onSubmitEditing={() => { if (!reply.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); setReply(""); }} />
          </View>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setLiked((v) => !v); }} hitSlop={10} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={liked ? "Unlike story" : "Like story"}>
            <Icon name="heart" size={26} color={liked ? "#F0407F" : "#FFFFFF"} />
          </Pressable>
          <Pressable onPress={() => { if (reply.trim()) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); setReply(""); } }} hitSlop={10} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Send reply">
            <Icon name="send" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
        {paused ? (
          <View style={styles.paused} pointerEvents="none">
            <Icon name="pause" size={14} color="#FFFFFF" />
            <Text style={styles.pausedText}>Paused</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  contentClip: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  topScrim: { position: "absolute", top: 0, left: 0, right: 0, height: 180, backgroundColor: "rgba(0,0,0,0.35)" },
  bottomScrim: { position: "absolute", bottom: 0, left: 0, right: 0, height: 160, backgroundColor: "rgba(0,0,0,0.35)" },
  tapRow: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  tapLeft: { width: "30%", height: "100%" },
  tapRight: { flex: 1, height: "100%" },
  chrome: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 12, gap: 10 },
  progressRow: { flexDirection: "row", gap: 5 },
  track: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.35)", overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 2 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  authorText: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", flexShrink: 1 },
  time: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "500", flexShrink: 0 },
  handle: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  replyBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingTop: 8 },
  inputWrap: { flex: 1, minHeight: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", paddingHorizontal: 16, justifyContent: "center" },
  input: { color: "#FFFFFF", fontSize: 15, paddingVertical: 10 },
  paused: { position: "absolute", top: "46%", alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.55)" },
  pausedText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
});




