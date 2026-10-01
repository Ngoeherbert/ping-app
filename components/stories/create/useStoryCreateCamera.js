import { useCallback, useRef } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { VIDEO_LIMIT, normLink } from "./constants";

export function useStoryCreateCamera({ camPerm, requestCamPerm, micPerm, requestMicPerm, camRef, setFacing, setFlash, setRecording, setRecSec }) {
  const recClock = useRef(null);

  const stopClock = useCallback(() => {
    if (recClock.current) clearInterval(recClock.current);
    recClock.current = null;
  }, []);

  const needCam = useCallback(async () => {
    if (camPerm?.granted) return true;
    const r = await requestCamPerm();
    if (!r.granted) Alert.alert("Camera needed", "Allow camera access to capture your status.");
    return r.granted;
  }, [camPerm, requestCamPerm]);

  const needMic = useCallback(async () => {
    if (micPerm?.granted) return true;
    const r = await requestMicPerm();
    if (!r.granted) Alert.alert("Microphone needed", "Allow microphone access to record video or voice.");
    return r.granted;
  }, [micPerm, requestMicPerm]);

  const takePhoto = useCallback(
    async (onMedia) => {
      if (!(await needCam())) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      try {
        const shot = await camRef.current?.takePictureAsync({ quality: 0.85, skipProcessing: true });
        if (shot?.uri) {
          onMedia({ kind: "image", uri: shot.uri });
          return;
        }
      } catch {}
      onMedia({ kind: "image", uri: `https://picsum.photos/seed/story-${Date.now()}/720/1280` });
    },
    [camRef, needCam]
  );

  const startVideo = useCallback(
    async (onMedia) => {
      if (!(await needCam())) return;
      await needMic();
      const cam = camRef.current;
      if (!cam?.recordAsync) {
        Alert.alert("Video unavailable", "This device preview cannot record right now.");
        return;
      }
      try {
        setRecording(true);
        setRecSec(0);
        recClock.current = setInterval(
          () =>
            setRecSec((x) => {
              if (x + 1 >= VIDEO_LIMIT) cam.stopRecording?.().catch(() => {});
              return Math.min(x + 1, VIDEO_LIMIT);
            }),
          1000
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        const res = await cam.recordAsync({ maxDuration: VIDEO_LIMIT });
        if (res?.uri) onMedia({ kind: "video", uri: res.uri, duration: VIDEO_LIMIT });
      } catch {
      } finally {
        setRecording(false);
        stopClock();
      }
    },
    [camRef, needCam, needMic, setRecSec, setRecording, stopClock]
  );

  const stopVideo = useCallback(() => {
    try {
      camRef.current?.stopRecording();
    } catch {}
  }, [camRef]);

  const pickMedia = useCallback(
    async (onMedia) => {
      Haptics.selectionAsync().catch(() => {});
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Photos needed", "Allow photo library access to upload media.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: false,
        quality: 0.9,
        videoMaxDuration: VIDEO_LIMIT,
      });
      if (res.canceled || !res.assets?.length) return;
      const a = res.assets[0];
      const isVid = (a.type ?? "").startsWith("video") || !!a.duration;
      onMedia({ kind: isVid ? "video" : "image", uri: a.uri, duration: Math.round((a.duration ?? 0) / 1000) || 0 });
    },
    []
  );

  const flip = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setFacing((f) => (f === "front" ? "back" : "front"));
  }, [setFacing]);

  const toggleFlash = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setFlash((f) => (f === "on" ? "off" : "on"));
  }, [setFlash]);

  return { stopClock, needCam, needMic, takePhoto, startVideo, stopVideo, pickMedia, flip, toggleFlash, normLink };
}
