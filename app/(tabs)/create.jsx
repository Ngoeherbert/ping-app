import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Icon from "../../components/ui/Icon";
import Avatar from "../../components/ui/Avatar";
import CustomModalSheet from "../../components/ui/CustomModalSheet";
import { palette } from "../../constants/colors";
import { useFeed, useReelsData, useStoriesData } from "../../hooks";
import { getPlaces, getSongs } from "../../lib/mockData";

const { height: WIN_H } = Dimensions.get("window");
const TIKTOK_RED = "#FE2C55";
const TIKTOK_CYAN = "#25F4EE";

const MODES = [
  { key: "reel", label: "Video", duration: "15s" },
  { key: "story", label: "Story", duration: "24h" },
  { key: "ping", label: "Gist", duration: "" },
  { key: "text", label: "Text", duration: "" },
];

const DURATIONS = ["60s", "15s", "10s", "5s", "3s"];
const SPEEDS = ["0.3x", "0.5x", "1x", "2x", "3x"];
const FILTERS = ["Normal", "Portrait", "Vivid", "Mono", "Warm", "Cool"];
const BEAUTY_LEVELS = ["Off", "Natural", "Smooth", "Bright"];

const SONGS = getSongs();
const PLACES = getPlaces();

const photo = (seed, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const VIDEO_POSTER = photo("create-video");
const VIDEO_URI =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const VIDEO_DURATION = "0:15";

function fmtClock(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function durationToSec(label) {
  const n = parseInt(label, 10);
  return Number.isFinite(n) ? n : 15;
}

function RailButton({ icon, label, active, badge, onPress, glyph }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.railBtn, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
    >
      <View style={[styles.railIcon, active && styles.railIconActive]}>
        {glyph ? (
          <Text style={[styles.railGlyph, active && styles.railGlyphActive]}>{glyph}</Text>
        ) : (
          <Icon name={icon} size={22} color="#FFFFFF" strokeWidth={active ? 2.2 : 1.7} />
        )}
        {!!badge && (
          <View style={styles.railBadge}>
            <Text style={styles.railBadgeText}>{badge}</Text>
          </View>
        )}
        {active && !badge && <View style={styles.railDot} />}
      </View>
      <Text style={[styles.railLabel, active && styles.railLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function OptionRow({ icon, title, value, onPress, last, glyph, danger }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.optRow, last && { borderBottomWidth: 0 }, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.optLeft}>
        {glyph ? (
          <Text style={[styles.optGlyph, danger && { color: TIKTOK_RED }]}>{glyph}</Text>
        ) : (
          <Icon name={icon} size={20} color={danger ? TIKTOK_RED : "#0F1419"} strokeWidth={1.8} />
        )}
        <Text style={[styles.optTitle, danger && { color: TIKTOK_RED }]}>{title}</Text>
      </View>
      {!!value && (
        <Text style={styles.optValue} numberOfLines={1}>
          {value}
        </Text>
      )}
      <Icon name="forward" size={16} color="#B9BDC4" strokeWidth={2} />
    </Pressable>
  );
}

function ToggleRow({ icon, title, value, onValueChange, glyph }) {
  return (
    <View style={[styles.optRow, { borderBottomWidth: 0 }]}>
      <View style={styles.optLeft}>
        {glyph ? (
          <Text style={styles.optGlyph}>{glyph}</Text>
        ) : (
          <Icon name={icon} size={20} color="#0F1419" strokeWidth={1.8} />
        )}
        <Text style={styles.optTitle}>{title}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#E4E4E8", true: TIKTOK_RED }} thumbColor="#FFFFFF" />
    </View>
  );
}

function ChipRow({ items, active, onPick }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} keyboardShouldPersistTaps="handled">
      {items.map((item) => {
        const on = item === active;
        return (
          <Pressable
            key={item}
            onPress={() => onPick(item)}
            style={({ pressed }) => [styles.sheetChip, on && styles.sheetChipActive, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={item}
          >
            <Text style={[styles.sheetChipText, on && styles.sheetChipTextActive]}>{item}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode: modeParam } = useLocalSearchParams();
  const { onCreatePing } = useFeed();
  const { myProfile, onCreateStory } = useStoriesData();
  const { onCreateReel } = useReelsData();

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const cameraRef = useRef(null);
  const recTimer = useRef(null);
  const tickTimer = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [screenFocused, setScreenFocused] = useState(true);
  const [stage, setStage] = useState("camera");
  const [mode, setMode] = useState("reel");
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [countdown, setCountdown] = useState("Off");
  const [speed, setSpeed] = useState("1x");
  const [filter, setFilter] = useState("Normal");
  const [beauty, setBeauty] = useState("Natural");
  const [duration, setDuration] = useState("15s");
  const [sheet, setSheet] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [countingDown, setCountingDown] = useState(0);

  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState("Everyone");
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(false);
  const [saveDevice, setSaveDevice] = useState(true);
  const [song, setSong] = useState(SONGS[0]);
  const [place, setPlace] = useState(null);
  const [cover, setCover] = useState(photo("create-cover", 400, 700));
  const [publishing, setPublishing] = useState(false);

  const songSheet = useRef(null);
  const locationSheet = useRef(null);
  const audienceSheet = useRef(null);
  const moreSheet = useRef(null);

  const maxSec = useMemo(() => durationToSec(duration), [duration]);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => setScreenFocused(false);
    }, [])
  );

  useEffect(() => {
    setStatusBarStyle(stage === "post" ? "dark" : "light");
  }, [stage]);

  useEffect(() => {
    const map = { video: "reel", reel: "reel", story: "story", photo: "ping", ping: "ping", text: "text" };
    const requested = map[String(modeParam ?? "").toLowerCase()];
    if (!requested) return;
    setMode(requested);
    setStage("camera");
    setCaptured(null);
    router.setParams({ mode: "" });
  }, [modeParam, router]);

  useEffect(() => () => {
    if (recTimer.current) clearInterval(recTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
  }, []);

  const openSheet = useCallback((key) => {
    Haptics.selectionAsync().catch(() => {});
    setSheet(key);
    requestAnimationFrame(() => {
      if (key === "music") songSheet.current?.open();
      if (key === "location") locationSheet.current?.open();
      if (key === "audience") audienceSheet.current?.open();
      if (key === "more") moreSheet.current?.open();
    });
  }, []);

  const closeSheets = useCallback(() => setSheet(null), []);

  const renderSheets = () => (
    <>
      <CustomModalSheet ref={songSheet} title="Add sound" onClose={closeSheets} showCloseButton footer={null}>
        <ScrollView style={styles.sheetList} contentContainerStyle={{ paddingBottom: 24 }}>
          {SONGS.map((s) => {
            const on = song?.id === s.id;
            return (
              <Pressable key={s.id} onPress={() => { setSong(s); Haptics.selectionAsync().catch(() => {}); songSheet.current?.close(); }} style={[styles.songRow, on && styles.songRowActive]} accessibilityRole="button" accessibilityLabel={s.title}>
                <View style={styles.songDisc}>
                  <Icon name="music" size={16} color="#FFFFFF" strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.songTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.songMeta} numberOfLines={1}>{s.artist} - {s.duration}</Text>
                </View>
                {on && <Icon name="check" size={18} color={TIKTOK_RED} strokeWidth={2.5} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </CustomModalSheet>

      <CustomModalSheet ref={locationSheet} title="Add location" onClose={closeSheets} showCloseButton footer={null}>
        <ScrollView style={styles.sheetList} contentContainerStyle={{ paddingBottom: 24 }}>
          <Pressable onPress={() => { setPlace(null); Haptics.selectionAsync().catch(() => {}); locationSheet.current?.close(); }} style={[styles.songRow, !place && styles.songRowActive]} accessibilityRole="button" accessibilityLabel="No location">
            <Icon name="close" size={18} color="#0F1419" strokeWidth={2} />
            <Text style={styles.songTitle}>No location</Text>
          </Pressable>
          {PLACES.map((p) => {
            const on = place?.id === p.id;
            return (
              <Pressable key={p.id} onPress={() => { setPlace(p); Haptics.selectionAsync().catch(() => {}); locationSheet.current?.close(); }} style={[styles.songRow, on && styles.songRowActive]} accessibilityRole="button" accessibilityLabel={p.name}>
                <Icon name="location" size={18} color={on ? TIKTOK_RED : "#0F1419"} strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.songTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.songMeta} numberOfLines={1}>{p.detail}</Text>
                </View>
                {on && <Icon name="check" size={18} color={TIKTOK_RED} strokeWidth={2.5} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </CustomModalSheet>

      <CustomModalSheet ref={audienceSheet} title="Who can watch this video?" onClose={closeSheets} showCloseButton footer={null}>
        <View style={{ paddingBottom: 24 }}>
          {["Everyone", "Friends", "Only you"].map((a) => {
            const on = audience === a;
            return (
              <Pressable key={a} onPress={() => { setAudience(a); Haptics.selectionAsync().catch(() => {}); audienceSheet.current?.close(); }} style={[styles.songRow, on && styles.songRowActive]} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={a}>
                <Text style={[styles.songTitle, on && { color: TIKTOK_RED }]}>{a}</Text>
                {on && <Icon name="check" size={18} color={TIKTOK_RED} strokeWidth={2.5} />}
              </Pressable>
            );
          })}
        </View>
      </CustomModalSheet>

      <CustomModalSheet ref={moreSheet} title={sheet === "speed" ? "Speed" : sheet === "filters" ? "Filters" : sheet === "beauty" ? "Beauty" : sheet === "effects" ? "Effects" : "Countdown"} onClose={closeSheets} showCloseButton footer={null}>
        <View style={{ paddingBottom: 28, gap: 14 }}>
          {(!sheet || sheet === "timer") && <ChipRow items={["Off", "3s", "5s", "10s"]} active={countdown} onPick={(v) => setCountdown(v)} />}
          {sheet === "speed" && <ChipRow items={SPEEDS} active={speed} onPick={(v) => setSpeed(v)} />}
          {sheet === "filters" && <ChipRow items={FILTERS} active={filter} onPick={(v) => setFilter(v)} />}
          {sheet === "beauty" && <ChipRow items={BEAUTY_LEVELS} active={beauty} onPick={(v) => setBeauty(v)} />}
          {sheet === "effects" && <ChipRow items={["None", "Green Screen", "Blur", "Retro", "Zoom"]} active="None" onPick={() => {}} />}
          <Text style={styles.sheetHint}>TikTok-style options for this capture.</Text>
        </View>
      </CustomModalSheet>
    </>
  );

  const needCamera = useCallback(async () => {
    if (camPerm?.granted) return true;
    const res = await requestCamPerm();
    if (!res.granted) {
      Alert.alert("Camera needed", "Allow camera access to shoot like TikTok.");
      return false;
    }
    return true;
  }, [camPerm, requestCamPerm]);

  const needMic = useCallback(async () => {
    if (micPerm?.granted) return true;
    const res = await requestMicPerm();
    return !!res.granted;
  }, [micPerm, requestMicPerm]);

  const beginRecordingClock = useCallback((limit) => {
    if (recTimer.current) clearInterval(recTimer.current);
    setElapsed(0);
    recTimer.current = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= limit) {
          if (recTimer.current) clearInterval(recTimer.current);
          return limit;
        }
        return s + 1;
      });
    }, 1000);
  }, []);

  const stopClock = useCallback(() => {
    if (recTimer.current) clearInterval(recTimer.current);
    recTimer.current = null;
  }, []);

  const startCountdownThen = useCallback((fn) => {
    const wait = countdown === "Off" ? 0 : parseInt(countdown, 10) || 0;
    if (!wait) {
      fn();
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    setCountingDown(wait);
    if (tickTimer.current) clearInterval(tickTimer.current);
    tickTimer.current = setInterval(() => {
      setCountingDown((c) => {
        if (c <= 1) {
          if (tickTimer.current) clearInterval(tickTimer.current);
          fn();
          return 0;
        }
        Haptics.selectionAsync().catch(() => {});
        return c - 1;
      });
    }, 1000);
  }, [countdown]);

  const takePhoto = useCallback(async () => {
    if (!(await needCamera())) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const shot = await cameraRef.current?.takePictureAsync({ quality: 0.9, skipProcessing: true });
      const uri = shot?.uri || photo(`snap-${Date.now()}`, 720, 1280);
      setCaptured({ kind: mode === "text" ? "text" : "photo", uri, elapsed: 0 });
      setCover(uri);
      setStage("post");
    } catch {
      const uri = photo(`snap-${Date.now()}`, 720, 1280);
      setCaptured({ kind: "photo", uri, elapsed: 0 });
      setCover(uri);
      setStage("post");
    }
  }, [mode, needCamera]);

  const beginVideoRecord = useCallback(async () => {
    if (!(await needCamera())) return;
    await needMic();
    const camera = cameraRef.current;
    if (!camera?.recordAsync) {
      setRecording(true);
      beginRecordingClock(maxSec);
      setTimeout(() => {
        setRecording(false);
        stopClock();
        setCaptured({ kind: "video", uri: VIDEO_URI, poster: VIDEO_POSTER, elapsed: maxSec });
        setStage("post");
      }, 1200);
      return;
    }
    try {
      setRecording(true);
      beginRecordingClock(maxSec);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const result = await camera.recordAsync({ maxDuration: maxSec });
      const uri = result?.uri || VIDEO_URI;
      setCaptured({ kind: "video", uri, poster: VIDEO_POSTER, elapsed });
      setStage("post");
    } catch {
      setCaptured({ kind: "video", uri: VIDEO_URI, poster: VIDEO_POSTER, elapsed });
      setStage("post");
    } finally {
      setRecording(false);
      stopClock();
    }
  }, [beginRecordingClock, elapsed, maxSec, needCamera, needMic, stopClock]);

  const stopVideoRecord = useCallback(async () => {
    try {
      await cameraRef.current?.stopRecording();
    } catch {}
  }, []);

  const onShutterPress = useCallback(() => {
    if (recording) {
      stopVideoRecord();
      return;
    }
    if (mode === "ping" || mode === "text") {
      startCountdownThen(takePhoto);
    } else {
      startCountdownThen(beginVideoRecord);
    }
  }, [beginVideoRecord, mode, recording, startCountdownThen, stopVideoRecord, takePhoto]);

  const pickFromLibrary = useCallback(async () => {
    Haptics.selectionAsync().catch(() => {});
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Photos needed", "Allow photo library access to upload.");
      return;
    }
    const videoMode = mode === "reel" || mode === "story";
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: videoMode ? ["images", "videos"] : ["images"],
      allowsEditing: false,
      quality: 0.9,
      videoMaxDuration: 180,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const isVideo = (asset.type ?? "").startsWith("video") || !!asset.duration;
    const media = {
      kind: isVideo ? "video" : mode === "text" ? "text" : "photo",
      uri: asset.uri,
      poster: asset.uri,
      elapsed: Math.round((asset.duration ?? maxSec * 1000) / 1000) || maxSec,
    };
    setCaptured(media);
    setCover(asset.uri);
    setStage("post");
  }, [maxSec, mode]);

  const resetCapture = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    stopClock();
    setRecording(false);
    setElapsed(0);
    setCaptured(null);
    setStage("camera");
  }, [stopClock]);

  const publish = useCallback(async () => {
    if (publishing) return;
    setPublishing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const media = captured ?? { kind: mode === "ping" ? "photo" : mode === "text" ? "text" : "video", uri: cover, poster: cover, elapsed: maxSec };
    const profile = myProfile ?? { id: "me", name: "You", handle: "@you", avatar: photo("me", 120, 120) };
    const stamp = Date.now();
    try {
      if (mode === "story") {
        onCreateStory({ cover: media.poster || media.uri });
        router.navigate("/");
      } else if (mode === "ping" || mode === "text") {
        onCreatePing({
          id: `ping-me-${stamp}`,
          userId: profile.id,
          user: profile.name,
          handle: profile.handle,
          avatar: profile.avatar,
          verified: false,
          time: "Just now",
          audience: audience.toLowerCase(),
          text: caption.trim() || (mode === "text" ? "Shared from Create" : ""),
          tags: [],
          likes: 0,
          replies: 0,
          liked: false,
          showFollow: false,
          tagged: [],
          media: media.kind === "photo" ? { type: "image", uri: media.uri } : null,
          song: song ? `${song.title} - ${song.artist}` : null,
          place: place ? place.name : null,
        });
        router.navigate("/");
      } else {
        onCreateReel({
          id: `reel-me-${stamp}`,
          userId: profile.id,
          user: profile.name,
          handle: profile.handle,
          avatar: profile.avatar,
          verified: false,
          videoUri: media.kind === "video" ? media.uri : VIDEO_URI,
          cover: media.poster || media.uri || cover,
          duration: media.kind === "video" ? fmtClock(media.elapsed || maxSec) : VIDEO_DURATION,
          description: caption.trim() || "Just posted from Create",
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          liked: false,
          music: song ? `${song.title} - ${song.artist}` : "Original sound",
          isSaved: false,
        });
        router.navigate("/reels");
      }
    } finally {
      setPublishing(false);
    }
  }, [audience, caption, captured, cover, maxSec, mode, myProfile, onCreatePing, onCreateReel, onCreateStory, place, publishing, router, song]);

  if (stage === "post") return (
    <>
      <PostScreen
        insets={insets}
        mode={mode}
        captured={captured}
        cover={cover}
        caption={caption}
        setCaption={setCaption}
        audience={audience}
        allowComments={allowComments}
        setAllowComments={setAllowComments}
        allowDuet={allowDuet}
        setAllowDuet={setAllowDuet}
        allowStitch={allowStitch}
        setAllowStitch={setAllowStitch}
        saveDevice={saveDevice}
        setSaveDevice={setSaveDevice}
        song={song}
        place={place}
        publishing={publishing}
        onBack={resetCapture}
        onPublish={publish}
        onOpenSheet={openSheet}
        myProfile={myProfile}
      />
      {renderSheets()}
    </>
  );

  const showPreview = screenFocused && cameraReady !== null;
  const isPhotoMode = mode === "ping" || mode === "text";

  return (
    <View style={styles.cameraRoot}>
      {showPreview ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
          mode={isPhotoMode ? "picture" : "video"}
          onCameraReady={() => setCameraReady(true)}
          onMountError={() => setCameraReady(false)}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraFallback]} />
      )}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.vignette]} />

      <View style={[styles.camTop, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => { Haptics.selectionAsync().catch(() => {}); router.back(); }} style={styles.camClose} accessibilityRole="button" accessibilityLabel="Close camera">
          <Icon name="close" size={22} color="#FFFFFF" strokeWidth={2.2} />
        </Pressable>
        <View style={styles.soundPill}>
          <Icon name="music" size={14} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.soundText} numberOfLines={1}>{song ? `${song.title} - ${song.artist}` : "Add sound"}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.camRight}>
        <RailButton icon="rotateCamera" label="Flip" active={facing === "front"} onPress={() => { Haptics.selectionAsync().catch(() => {}); setFacing((f) => (f === "front" ? "back" : "front")); }} />
        <RailButton icon={flash === "on" ? "flash" : "flashOff"} label={flash === "on" ? "Flash on" : "Flash"} active={flash === "on"} onPress={() => { Haptics.selectionAsync().catch(() => {}); setFlash((f) => (f === "on" ? "off" : "on")); }} />
        <RailButton icon="timer" label={countdown === "Off" ? "Timer" : countdown} active={countdown !== "Off"} badge={countdown === "Off" ? null : countdown.replace("s", "")} onPress={() => openSheet("timer")} />
        <RailButton icon="sparkle" label={beauty === "Off" ? "Beauty" : beauty} active={beauty !== "Off"} onPress={() => openSheet("beauty")} />
        <RailButton icon="image" label={filter === "Normal" ? "Filters" : filter} active={filter !== "Normal"} onPress={() => openSheet("filters")} />
        <RailButton icon="mic" label={speed === "1x" ? "Speed" : speed} active={speed !== "1x"} onPress={() => openSheet("speed")} />
      </View>

      {(recording || countingDown > 0) && (
        <View style={[styles.recBadge, { top: insets.top + 64 }]}>
          {countingDown > 0 ? (
            <Text style={styles.countBig}>{countingDown}</Text>
          ) : (
            <>
              <View style={styles.recDot} />
              <Text style={styles.recText}>{fmtClock(elapsed)}</Text>
            </>
          )}
        </View>
      )}

      <View style={[styles.camBottom, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {!isPhotoMode && (
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => {
              const on = d === duration;
              return (
                <Pressable key={d} onPress={() => { Haptics.selectionAsync().catch(() => {}); setDuration(d); }} style={[styles.durationPill, on && styles.durationPillActive]} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${d} video`}>
                  <Text style={[styles.durationText, on && styles.durationTextActive]}>{d}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.captureRow}>
          <Pressable onPress={pickFromLibrary} style={styles.uploadTile} accessibilityRole="button" accessibilityLabel="Upload from gallery">
            <Icon name="image" size={20} color="#FFFFFF" strokeWidth={1.8} />
            <Text style={styles.uploadText}>Upload</Text>
          </Pressable>

          <Pressable
            onPress={onShutterPress}
            onLongPress={() => { if (!isPhotoMode && !recording) beginVideoRecord(); }}
            delayLongPress={350}
            style={({ pressed }) => [styles.shutterOuter, pressed && { transform: [{ scale: 0.94 }] }]}
            accessibilityRole="button"
            accessibilityLabel={isPhotoMode ? "Take photo" : recording ? "Stop recording" : "Record video"}
          >
            <View style={[styles.shutterRing, recording && styles.shutterRingRec]}>
              <View style={[styles.shutterCore, recording ? styles.shutterStop : isPhotoMode ? styles.shutterPhoto : styles.shutterVideo]} />
            </View>
          </Pressable>

          <Pressable onPress={() => openSheet("effects")} style={styles.uploadTile} accessibilityRole="button" accessibilityLabel="Effects">
            <Text style={styles.effectGlyph}>{"\u2728"}</Text>
            <Text style={styles.uploadText}>Effects</Text>
          </Pressable>
        </View>

        <View style={styles.modeRow}>
          {MODES.map((m) => {
            const on = m.key === mode;
            return (
              <Pressable key={m.key} onPress={() => { Haptics.selectionAsync().catch(() => {}); setMode(m.key); }} style={styles.modeBtn} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={m.label}>
                <Text style={[styles.modeText, on && styles.modeTextActive]}>{m.label}</Text>
                {on && <View style={styles.modeDot} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {!camPerm?.granted && (
        <View style={[styles.permBar, { bottom: 190 }]}>
          <Text style={styles.permText}>Camera access is off — preview is a placeholder.</Text>
          <Pressable onPress={needCamera} style={styles.permBtn} accessibilityRole="button" accessibilityLabel="Enable camera">
            <Text style={styles.permBtnText}>Enable</Text>
          </Pressable>
        </View>
      )}

      {renderSheets()}
    </View>
  );
}
function PostScreen({
  insets, mode, captured, cover, caption, setCaption, audience,
  allowComments, setAllowComments, allowDuet, setAllowDuet,
  allowStitch, setAllowStitch, saveDevice, setSaveDevice,
  song, place, publishing, onBack, onPublish, onOpenSheet, myProfile,
}) {
  const previewUri = captured?.poster || captured?.uri || cover;
  const isVideo = (captured?.kind ?? (mode === "reel" || mode === "story" ? "video" : "photo")) === "video";
  const modeLabel = mode === "story" ? "Story - 24 hours" : mode === "ping" ? "Photo ping" : mode === "text" ? "Text post" : "Video reel";
  const canPost = mode === "story" ? !!previewUri : caption.trim().length > 0 || !!previewUri;
  return (
    <View style={styles.postRoot}>
      <View style={[styles.postHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onBack} style={styles.postBack} accessibilityRole="button" accessibilityLabel="Back to camera">
          <Icon name="back" size={22} color="#0F1419" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.postTitle}>Post</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.postBody} keyboardShouldPersistTaps="handled">
          <View style={styles.postTopRow}>
            <View style={styles.postCoverWrap}>
              {!!previewUri && <Image source={{ uri: previewUri }} style={styles.postCover} resizeMode="cover" />}
              {isVideo && (
                <View style={styles.postPlay}>
                  <Icon name="play" size={14} color="#FFFFFF" strokeWidth={2.2} />
                </View>
              )}
            </View>
            <TextInput
              style={styles.postInput}
              placeholder="Add description...  #hashtags  #@friends"
              placeholderTextColor="#9AA0A8"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={2200}
              textAlignVertical="top"
              accessibilityLabel="Description"
            />
          </View>
          <View style={styles.hashRow}>
            <Text style={styles.hashStrong}># Hashtags</Text>
            <Text style={styles.hashStrong}># @</Text>
          </View>
          <View style={styles.postCard}>
            <OptionRow icon="music" title="Add sound" value={song ? `${song.title}` : "Original sound"} onPress={() => onOpenSheet("music")} />
            <OptionRow icon="location" title="Add location" value={place ? place.name : ""} onPress={() => onOpenSheet("location")} />
            <OptionRow icon="users" title="Who can watch this video" value={audience} onPress={() => onOpenSheet("audience")} last />
          </View>
          <View style={styles.postCard}>
            <ToggleRow icon="comment" title="Allow comments" value={allowComments} onValueChange={setAllowComments} />
            <ToggleRow icon="users" title="Allow Duet" value={allowDuet} onValueChange={setAllowDuet} />
            <ToggleRow icon="edit" title="Allow Stitch" value={allowStitch} onValueChange={setAllowStitch} />
            <ToggleRow icon="download" title="Save to device" value={saveDevice} onValueChange={setSaveDevice} />
          </View>
          <View style={styles.postMetaRow}>
            <Avatar uri={myProfile?.avatar} name={myProfile?.name ?? "You"} size={30} />
            <View style={{ flex: 1 }}>
              <Text style={styles.postMetaName} numberOfLines={1}>{myProfile?.name ?? "You"} {myProfile?.handle ?? "@you"}</Text>
              <Text style={styles.postMetaSub}>{modeLabel}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.postFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable onPress={onBack} style={styles.draftBtn} accessibilityRole="button" accessibilityLabel="Drafts">
            <Text style={styles.draftText}>Drafts</Text>
          </Pressable>
          <Pressable onPress={onPublish} disabled={!canPost || publishing} style={[styles.postBtn, (!canPost || publishing) && styles.postBtnDisabled]} accessibilityRole="button" accessibilityLabel="Post">
            <Text style={styles.postBtnText}>{publishing ? "Posting..." : "Post"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraRoot: { flex: 1, backgroundColor: "#000000" },
  cameraFallback: { backgroundColor: "#101014" },
  vignette: { backgroundColor: "rgba(0,0,0,0.12)" },
  camTop: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, zIndex: 5 },
  camClose: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" },
  soundPill: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "62%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.38)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  soundText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600", maxWidth: 220 },
  camRight: { position: "absolute", right: 8, top: WIN_H * 0.24, alignItems: "center", gap: 14, zIndex: 5 },
  railBtn: { alignItems: "center", width: 62 },
  railIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.38)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  railIconActive: { backgroundColor: "rgba(254,44,85,0.85)", borderColor: TIKTOK_RED },
  railGlyph: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  railGlyphActive: { color: "#FFFFFF" },
  railLabel: { marginTop: 4, color: "rgba(255,255,255,0.92)", fontSize: 11, fontWeight: "600" },
  railLabelActive: { color: "#FFFFFF", fontWeight: "800" },
  railBadge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: TIKTOK_RED, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  railBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  railDot: { position: "absolute", bottom: -2, width: 6, height: 6, borderRadius: 3, backgroundColor: TIKTOK_CYAN },
  recBadge: { position: "absolute", alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 6 },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: TIKTOK_RED },
  recText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  countBig: { color: "#FFFFFF", fontSize: 44, fontWeight: "900" },
  camBottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, zIndex: 5 },
  durationRow: { flexDirection: "row", alignSelf: "center", gap: 8, marginBottom: 12, padding: 4, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.38)" },
  durationPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  durationPillActive: { backgroundColor: "#FFFFFF" },
  durationText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700" },
  durationTextActive: { color: "#111114" },
  captureRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  uploadTile: { width: 64, alignItems: "center", gap: 4, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.35)" },
  uploadText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  effectGlyph: { color: "#FFFFFF", fontSize: 20 },
  shutterOuter: { alignItems: "center", justifyContent: "center" },
  shutterRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 5, borderColor: TIKTOK_RED, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.15)" },
  shutterRingRec: { borderColor: "#FFFFFF" },
  shutterCore: { width: 62, height: 62, borderRadius: 31 },
  shutterVideo: { backgroundColor: TIKTOK_RED },
  shutterPhoto: { backgroundColor: "#FFFFFF" },
  shutterStop: { width: 34, height: 34, borderRadius: 8, backgroundColor: TIKTOK_RED },
  modeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 12 },
  modeBtn: { alignItems: "center", gap: 4, paddingVertical: 6, minWidth: 52 },
  modeText: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: "600" },
  modeTextActive: { color: "#FFFFFF", fontWeight: "800" },
  modeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#FFFFFF" },
  permBar: { position: "absolute", left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.65)", zIndex: 7 },
  permText: { flex: 1, color: "#FFFFFF", fontSize: 12, lineHeight: 17 },
  permBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FFFFFF" },
  permBtnText: { color: "#111114", fontSize: 13, fontWeight: "800" },
  sheetList: { maxHeight: 420 },
  sheetHint: { fontSize: 12, color: palette.muted, lineHeight: 17 },
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  sheetChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: palette.line, backgroundColor: "#FFFFFF" },
  sheetChipActive: { borderColor: TIKTOK_RED, backgroundColor: "#FFF0F3" },
  sheetChipText: { fontSize: 13, fontWeight: "700", color: palette.ink },
  sheetChipTextActive: { color: TIKTOK_RED },
  songRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  songRowActive: { backgroundColor: "#FFF7F9" },
  songDisc: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.surface, alignItems: "center", justifyContent: "center" },
  songTitle: { fontSize: 14, fontWeight: "700", color: palette.ink },
  songMeta: { fontSize: 12, color: palette.muted, marginTop: 2 },
  postRoot: { flex: 1, backgroundColor: "#FFFFFF" },
  postHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  postBack: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  postTitle: { fontSize: 17, fontWeight: "800", color: palette.ink },
  postBody: { padding: 16, paddingBottom: 12, gap: 12 },
  postTopRow: { flexDirection: "row", gap: 12 },
  postCoverWrap: { width: 96, height: 132, borderRadius: 10, overflow: "hidden", backgroundColor: "#111114", alignItems: "center", justifyContent: "center" },
  postCover: { width: "100%", height: "100%" },
  postPlay: { position: "absolute", width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  postInput: { flex: 1, minHeight: 132, fontSize: 15, color: palette.ink, lineHeight: 21, paddingTop: 2 },
  hashRow: { flexDirection: "row", gap: 18, paddingVertical: 2 },
  hashStrong: { fontSize: 14, fontWeight: "800", color: palette.ink },
  postCard: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: palette.line },
  optRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  optLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  optGlyph: { fontSize: 19, color: "#0F1419", width: 24, textAlign: "center" },
  optTitle: { fontSize: 15, fontWeight: "500", color: palette.ink },
  optValue: { maxWidth: 140, fontSize: 13, color: palette.muted, textAlign: "right" },
  postMetaRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  postMetaName: { fontSize: 14, fontWeight: "700", color: palette.ink },
  postMetaSub: { fontSize: 12, color: palette.muted, marginTop: 1 },
  postFooter: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line, backgroundColor: "#FFFFFF" },
  draftBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 4, backgroundColor: "#F1F1F4" },
  draftText: { fontSize: 15, fontWeight: "700", color: palette.ink },
  postBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 4, backgroundColor: TIKTOK_RED },
  postBtnDisabled: { backgroundColor: "#E9E9EE" },
  postBtnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
});