import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import * as Haptics from "expo-haptics";

import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import VerifiedBadge from "../ui/VerifiedBadge";
import { formatLikes } from "../../lib/mockData";

const WIDTH = Dimensions.get("window").width;
const DOUBLE_TAP_MS = 280;

/**
 * MusicTicker — the scrolling "song · artist" credit under a reel, like the
 * marquee TikTok shows at the bottom of every video.
 */
function MusicTicker({ text }) {
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!textWidth) return undefined;

    translateX.setValue(0);
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -textWidth,
        duration: Math.max(textWidth * 40, 4000),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();

    return () => loop.stop();
  }, [text, textWidth, translateX]);

  return (
    <View style={styles.tickerWrap}>
      <Icon name="music" size={14} color="#FFFFFF" />
      <View style={styles.tickerViewport}>
        <Animated.View style={[styles.tickerRow, { transform: [{ translateX }] }]}>
          <Text
            style={styles.tickerText}
            numberOfLines={1}
            onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          >
            {text}
          </Text>
          <Text style={[styles.tickerText, styles.tickerClone]} numberOfLines={1}>
            {text}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

/** Rotating album disc pinned to the bottom of the action rail. */
function MusicDisc({ uri, spinning }) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!spinning) {
      rotate.stopAnimation();
      return undefined;
    }

    const loop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();

    return () => loop.stop();
  }, [spinning, rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.disc, { transform: [{ rotate: spin }] }]}>
      {uri ? (
        <Image source={{ uri }} style={styles.discImage} />
      ) : (
        <View style={[styles.discImage, styles.discFallback]} />
      )}
    </Animated.View>
  );
}

/** One tappable button in the right-hand action rail. */
function RailAction({
  icon,
  label,
  active = false,
  activeColor = "#FFFFFF",
  onPress,
  accessibilityLabel,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.railAction, pressed && styles.railPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.railIconWrap}>
        <Icon
          name={icon}
          size={30}
          color={active ? activeColor : "#FFFFFF"}
          strokeWidth={active ? 2.2 : 1.8}
        />
      </View>
      <Text style={styles.railLabel}>{label}</Text>
    </Pressable>
  );
}

export default function ReelItem({
  reel,
  height,
  isActive,
  shouldMount = false,
  onLike,
  onSave,
  onComment,
  onShare,
  onProfilePress,
  bottomInset = 0,
}) {
  const source = useMemo(
    () => (reel.videoUri ? { uri: reel.videoUri, contentType: "progressive" } : null),
    [reel.videoUri]
  );

  // The player is always created (hooks can't be conditional) but it only gets
  // a source once the reel is close to the viewport, so a long feed doesn't
  // spin up decoders for videos nobody is looking at.
  const player = useVideoPlayer(shouldMount ? source : null, (instance) => {
    instance.loop = true;
    instance.muted = false;
  });

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [following, setFollowing] = useState(false);
  const [reposted, setReposted] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);
  const singleTapTimer = useRef(null);

  // Play the active reel, pause + rewind everything else.
  useEffect(() => {
    if (!shouldMount) return;

    if (isActive) {
      setPaused(false);
      try {
        player.play();
      } catch {
        // ignore: source may still be loading
      }
    } else {
      setPaused(false);
      try {
        player.pause();
        player.currentTime = 0;
      } catch {
        // ignore
      }
      progress.setValue(0);
    }
  }, [isActive, shouldMount, player, progress]);

  // Player events: readiness, failure, play state and progress.
  useEffect(() => {
    if (!shouldMount) return undefined;

    // The player instance is recreated once a reel gets close enough to mount,
    // so re-sync local state with the fresh instance instead of waiting for an
    // event that may already have fired.
    try {
      setReady(player.status === "readyToPlay");
      setFailed(player.status === "error");
    } catch {
      // status can be unavailable before the first load
    }

    try {
      player.timeUpdateEventInterval = 0.25;
    } catch {
      // not fatal — the progress line just stays at 0
    }

    const subscriptions = [
      player.addListener("statusChange", (payload) => {
        if (payload?.status === "readyToPlay") {
          setReady(true);
          setFailed(false);
        }
        if (payload?.status === "error") {
          setFailed(true);
          setReady(false);
        }
      }),
      player.addListener("playingChange", (payload) => {
        setPaused(!payload?.isPlaying);
      }),
      player.addListener("timeUpdate", (payload) => {
        const duration = player.duration || 0;
        if (duration > 0 && typeof payload?.currentTime === "number") {
          progress.setValue(
            Math.min(Math.max(payload.currentTime / duration, 0), 1)
          );
        }
      }),
    ];

    return () => subscriptions.forEach((sub) => sub?.remove?.());
  }, [player, progress, shouldMount]);

  useEffect(() => {
    return () => {
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
    };
  }, []);

  const togglePlayback = useCallback(() => {
    try {
      if (player.playing) {
        player.pause();
        setPaused(true);
      } else {
        player.play();
        setPaused(false);
      }
    } catch {
      // ignore
    }
  }, [player]);

  const burstHeart = useCallback(() => {
    heartScale.setValue(0.3);
    heartOpacity.setValue(1);
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1.1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(360),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [heartOpacity, heartScale]);

  // Single tap = pause / resume. Double tap = like, TikTok style.
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      lastTap.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      burstHeart();
      if (!reel.liked) onLike?.(reel);
      return;
    }

    lastTap.current = now;
    if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
    singleTapTimer.current = setTimeout(() => {
      lastTap.current = 0;
      togglePlayback();
    }, DOUBLE_TAP_MS);
  }, [burstHeart, onLike, reel, togglePlayback]);

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    burstHeart();
    onLike?.(reel);
  }, [burstHeart, onLike, reel]);

  const handleSave = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    onSave?.(reel);
  }, [onSave, reel]);

  const handleShare = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    onShare?.(reel);
  }, [onShare, reel]);

  const handleFollow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFollowing((value) => !value);
  }, []);

  const handleRepost = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setReposted((value) => !value);
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.wrap, { width: WIDTH, height }]}>
      {/* Poster frame stays underneath so there is never a black flash. */}
      {reel.cover ? (
        <Image source={{ uri: reel.cover }} style={styles.media} resizeMode="cover" />
      ) : (
        <View style={[styles.media, styles.mediaFallback]} />
      )}

      {shouldMount && !failed && (
        <VideoView
          player={player}
          style={styles.media}
          contentFit="cover"
          nativeControls={false}
          fullscreenOptions={{ enable: false }}
          allowsPictureInPicture={false}
          surfaceType="textureView"
        />
      )}

      {/* Tap layer sits above the video but below the chrome. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleTap}
        accessibilityRole="button"
        accessibilityLabel={`${reel.user} reel. Double tap to like.`}
      />

      {/* Scrims keep the white overlays readable on any frame. */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent"]}
        style={styles.topScrim}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      {failed && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <View style={styles.statePill}>
            <Icon name="reels" size={20} color="#FFFFFF" />
            <Text style={styles.stateText}>Video unavailable</Text>
          </View>
        </View>
      )}

      {!failed && paused && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <View style={styles.playOverlay}>
            <Icon name="play" size={38} color="#FFFFFF" />
          </View>
        </View>
      )}

      <Animated.View
        style={[
          styles.heartBurst,
          { opacity: heartOpacity, transform: [{ scale: heartScale }] },
        ]}
        pointerEvents="none"
      >
        <Icon name="heart" size={104} color="#F0407F" strokeWidth={1.4} />
      </Animated.View>

      {/* Sound toggle, under the top bar. */}

      {/* Bottom info block: author, caption, music. */}
      <View
        style={[styles.info, { paddingBottom: 26 + bottomInset }]}
        pointerEvents="box-none"
      >
        <View style={styles.authorRow} pointerEvents="box-none">
          <Pressable
            onPress={() => onProfilePress?.(reel)}
            style={styles.authorAvatarBtn}
            accessibilityRole="button"
            accessibilityLabel={`View ${reel.user}'s profile`}
          >
            <Avatar
              uri={reel.avatar}
              name={reel.user}
              size={34}
              style={styles.authorAvatar}
            />
          </Pressable>

          <Pressable
            onPress={() => onProfilePress?.(reel)}
            style={styles.handleBtn}
            accessibilityRole="button"
            accessibilityLabel={`View ${reel.user}'s profile`}
          >
            <Text style={styles.handle} numberOfLines={1}>
              {reel.handle}
            </Text>
            {reel.verified && (
              <VerifiedBadge
                variant={reel.verifiedVariant || "blue"}
                size={15}
                inline
              />
            )}
          </Pressable>

          <Pressable
            onPress={handleFollow}
            style={[styles.followPill, following && styles.followPillActive]}
            accessibilityRole="button"
            accessibilityLabel={
              following ? `Unfollow ${reel.user}` : `Follow ${reel.user}`
            }
          >
            <Text
              style={[
                styles.followPillText,
                following && styles.followPillTextActive,
              ]}
            >
              {following ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.caption} numberOfLines={2}>
          {reel.description}
        </Text>

        <MusicTicker text={`${reel.music}  ·  original sound`} />
      </View>

      {/* Right-hand action rail. */}
      <View
        style={[styles.rail, { paddingBottom: 30 + bottomInset }]}
        pointerEvents="box-none"
      >
        <RailAction
          icon="heart"
          label={formatLikes(reel.likes)}
          active={!!reel.liked}
          activeColor="#F0407F"
          onPress={handleLike}
          accessibilityLabel={`Like ${reel.user}'s reel`}
        />

        <RailAction
          icon="comment"
          label={formatLikes(reel.comments)}
          onPress={() => onComment?.(reel)}
          accessibilityLabel={`Comment on ${reel.user}'s reel`}
        />

        <RailAction
          icon="repost"
          label={formatLikes((reel.reposts || 0) + (reposted ? 1 : 0))}
          active={reposted}
          activeColor="#22C55E"
          onPress={handleRepost}
          accessibilityLabel={
            reposted ? "Undo repost" : `Repost ${reel.user}'s reel`
          }
        />

        <RailAction
          icon="bookmark"
          label={reel.isSaved ? "Saved" : "Save"}
          active={!!reel.isSaved}
          activeColor="#F5C518"
          onPress={handleSave}
          accessibilityLabel={reel.isSaved ? "Remove from saved" : "Save reel"}
        />

        <RailAction
          icon="share"
          label={formatLikes(reel.shares)}
          onPress={handleShare}
          accessibilityLabel={`Share ${reel.user}'s reel`}
        />

        <MusicDisc uri={reel.cover} spinning={isActive && !paused} />
      </View>

      {/* Thin playback progress line hugging the bottom edge. */}
      <View style={styles.progressTrack} pointerEvents="none">
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {!ready && !failed && isActive && (
        <View style={styles.loadingRow} pointerEvents="none">
          <Icon name="spinner" size={16} color="rgba(255,255,255,0.9)" />
        </View>
      )}
    </View>
  );
}

const RAIL_ICON = 34;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    width: WIDTH,
  },
  mediaFallback: { backgroundColor: "#101014" },

  topScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 340,
  },

  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playOverlay: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  statePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  stateText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  heartBurst: {
    position: "absolute",
    top: "38%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },

  muteBtn: {
    position: "absolute",
    top: 100,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: 14,
    paddingRight: 96,
    gap: 8,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  authorAvatarBtn: { borderRadius: 17 },
  authorAvatar: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  },
  handleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  handle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  followPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  followPillActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "transparent",
  },
  followPillText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  followPillTextActive: { color: "rgba(255,255,255,0.85)" },

  caption: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "500",
  },

  tickerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: WIDTH - 120,
  },
  tickerViewport: { flex: 1, overflow: "hidden" },
  tickerRow: { flexDirection: "row" },
  tickerText: { color: "#FFFFFF", fontSize: 13, flexShrink: 0 },
  tickerClone: { paddingLeft: 48 },

  rail: {
    position: "absolute",
    right: 8,
    bottom: 0,
    alignItems: "center",
    gap: 20,
    width: 72,
  },
  railAction: { alignItems: "center", gap: 4 },
  railPressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
  railIconWrap: {
    width: RAIL_ICON,
    height: RAIL_ICON,
    alignItems: "center",
    justifyContent: "center",
  },
  railLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 4,
  },

  disc: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A1A1E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  discImage: { width: 26, height: 26, borderRadius: 13 },
  discFallback: { backgroundColor: "#5B57FF" },

  progressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  progressFill: {
    height: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },

  loadingRow: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
