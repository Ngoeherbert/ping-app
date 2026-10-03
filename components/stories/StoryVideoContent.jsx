import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import StoryFallback from "./StoryFallback";

const LOAD_TIMEOUT = 15000;

/**
 * Video story content. Autoplays when the story becomes active, pauses with
 * the viewer, reports playback position (for the viewer's progress bar) and
 * fires onFinish exactly once when the clip ends.
 *
 * `rate` > 1 fast-forwards playback (press-and-hold in the viewer) instead of
 * freezing it, so holding never interrupts the clip.
 */
export default function StoryVideoContent({ uri, paused, rate = 1, onProgress, onFinish }) {
  const [phase, setPhase] = useState(uri ? "loading" : "error");
  const finishedRef = useRef(false);
  const player = useVideoPlayer(uri ? { uri, contentType: "progressive" } : null, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25;
    // `paused` closes over the first render: a wipe snapshot (mounted paused)
    // must not start playing underneath the incoming story.
    if (!paused) {
      try {
        p.play();
      } catch {}
    }
  });

  useEffect(() => {
    if (!uri) return undefined;
    const subs = [];
    const safeAdd = (name, fn) => {
      try {
        const sub = player.addListener?.(name, fn);
        if (sub) subs.push(sub);
      } catch {}
    };
    safeAdd("statusChange", (s) => {
      if (s?.error || s?.status === "error") {
        setPhase("error");
        return;
      }
      if (s?.status === "readyToPlay") setPhase("ready");
    });
    safeAdd("timeUpdate", () => {
      try {
        const d = player.duration;
        if (d > 0) onProgress?.(Math.min(Math.max(player.currentTime / d, 0), 1));
      } catch {}
    });
    safeAdd("playToEnd", () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onProgress?.(1);
      onFinish?.();
    });
    try {
      if (player.status === "readyToPlay") setPhase("ready");
      else if (player.status === "error") setPhase("error");
    } catch {}
    const timeout = setTimeout(() => setPhase((p) => (p === "loading" ? "error" : p)), LOAD_TIMEOUT);
    return () => {
      clearTimeout(timeout);
      subs.forEach((sub) => {
        try {
          sub.remove?.();
        } catch {}
      });
      try {
        player.pause();
      } catch {}
    };
  }, [player, uri, onProgress, onFinish]);

  useEffect(() => {
    try {
      if (paused) player.pause();
      else if (phase === "ready" && !finishedRef.current) player.play();
    } catch {}
  }, [paused, phase, player]);

  // Hold-to-fast-forward. Re-assert playback as well, since a clip that paused
  // on the final frame must resume even though `paused` never changed.
  useEffect(() => {
    try {
      player.playbackRate = rate;
      if (rate > 1 && phase === "ready" && !finishedRef.current) player.play();
    } catch {}
  }, [rate, phase, player]);

  if (phase === "error") {
    return <StoryFallback icon="video" title="Video unavailable" sub="This video could not be played." />;
  }
  return (
    <View style={StyleSheet.absoluteFill}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        // "contain" fits the whole clip inside the frame rather than cropping it
        // to fill, so nothing of the video is cut off at the edges.
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      {phase === "loading" ? (
        <View style={s.center}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});