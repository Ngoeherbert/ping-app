import StoryCreateForm from "../components/stories/create/StoryCreateForm";

export default function StoryCreateRoute() {
  return <StoryCreateForm />;
}

/* Legacy inline implementation removed.

import { setStatusBarStyle } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../../components/ui/Icon";
import Avatar from "../../components/ui/Avatar";
import VoiceBubble from "../../components/messages/VoiceBubble";
import { useStoriesData } from "../../hooks/useStoriesData";
import { TEXT_BGS, TEXT_FONTS, PRIVACY, normLink, linkDomain, fmtDur } from "../../components/stories/create/constants";
import { s } from "../../components/stories/create/styles";
import { CaptureBtn, EditorTopBar } from "../../components/stories/create/StoryCreateChrome";
import StoryVideoPreview from "../../components/stories/create/StoryVideoPreview";
import { StatusLinkSheet, StatusPrivacySheet } from "../../components/stories/create/StatusSheets";
import StatusAudioSheet from "../../components/stories/create/StatusAudioSheet";
import { useStoryCreateCamera } from "../../components/stories/create/useStoryCreateCamera";

export default function StoryCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { myProfile, onCreateStory } = useStoriesData();
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const camRef = useRef(null);
  const linkSheet = useRef(null);
  const privacySheet = useRef(null);
  const audioSheet = useRef(null);
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [focused, setFocused] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [media, setMedia] = useState(null);
  const [textMode, setTextMode] = useState(false);
  const [textVal, setTextVal] = useState("");
  const [textBg, setTextBg] = useState(TEXT_BGS[0]);
  const [textFont, setTextFont] = useState(TEXT_FONTS[1].key);
  const [caption, setCaption] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [link, setLink] = useState(null);
  const [privacy, setPrivacy] = useState(PRIVACY[0]);
  const [posting, setPosting] = useState(false);
  const [published, setPublished] = useState(false);

  const cam = useStoryCreateCamera({ camPerm, requestCamPerm, micPerm, requestMicPerm, camRef, setFacing, setFlash, setRecording, setRecSec });
  const showCamera = !media && !textMode;

  useFocusEffect(useCallback(() => {
    setFocused(true);
    setStatusBarStyle("light");
    return () => setFocused(false);
  }, []));
  useEffect(() => () => cam.stopClock(), [cam]);

  const discard = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    cam.stopClock();
    setRecording(false);
    setMedia(null);
    setTextMode(false);
    setTextVal("");
    setCaption("");
    setLink(null);
    setLinkInput("");
  }, [cam]);

  const goBack = useCallback(() => {
    if (media || textMode) discard();
    setStatusBarStyle("dark");
    router.back();
  }, [discard, media, router, textMode]);

  const openSheet = useCallback((which) => {
    Haptics.selectionAsync().catch(() => {});
    requestAnimationFrame(() => {
      if (which === "link") linkSheet.current?.open?.();
      if (which === "privacy") privacySheet.current?.open?.();
    });
  }, []);
  const canPost = !!media || (textMode && textVal.trim().length > 0);
  const doPost = useCallback(async () => {
    if (!canPost || posting) return;
    setPosting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const cap = textMode ? "" : caption.trim();
    const payload = media
      ? { kind: media.kind, uri: media.uri, videoUri: media.kind === "video" ? media.uri : undefined, cover: media.uri, caption: cap, link, duration: media.duration ?? 0 }
      : { kind: "text", uri: null, cover: null, caption: cap, link, bg: textBg, font: textFont, duration: 0, text: textVal.trim() };
    onCreateStory(payload);
    await new Promise((r) => setTimeout(r, 500));
    setPosting(false);
    setPublished(true);
  }, [canPost, caption, link, media, onCreateStory, posting, textBg, textFont, textMode, textVal]);
  const goView = useCallback(() => {
    setStatusBarStyle("dark");
    router.navigate("/");
  }, [router]);
  const applyLink = useCallback(() => {
    const url = normLink(linkInput);
    if (!url) {
      Alert.alert("Invalid link", "Enter a valid URL like example.com");
      return;
    }
    setLink(url);
    setLinkInput("");
    try {
      linkSheet.current?.close?.();
    } catch {}
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [linkInput]);
  const fontWeight = useMemo(() => TEXT_FONTS.find((f) => f.key === textFont)?.weight ?? "700", [textFont]);
  if (published) {
    return (
      <View style={s.doneRoot}>
        <View style={[s.doneCard, { marginTop: insets.top + 60 }]}>
          <View style={s.doneTick}>
            <Icon name="check" size={30} color="#FFFFFF" />
          </View>
          <Text style={s.doneTitle}>Status posted</Text>
          <Text style={s.doneSub}>Visible to {privacy.toLowerCase()} for 24 hours</Text>
          <CaptureBtn label="View status" primary onPress={goView} />
          <CaptureBtn label="Post another" onPress={() => { setPublished(false); discard(); }} />
        </View>
      </View>
    );
  }
  return (
    <View style={s.root}>
      {showCamera && focused ? (
        <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing={facing} flash={flash} mode="video" />
      ) : null}
      {media?.kind === "image" ? (
        <Image source={{ uri: media.uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : null}
      {media?.kind === "video" ? <StoryVideoPreview uri={media.uri} /> : null}
      {media?.kind === "audio" ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#111B21", alignItems: "center", justifyContent: "center", padding: 28 }]}>
          <Icon name="mic" size={64} color="#00A884" />
          <Text style={{ color: "#FFFFFF", marginTop: 12, fontSize: 16, fontWeight: "700" }}>Voice status - {fmtDur(media.duration ?? 0)}</Text>
        </View>
      ) : null}
      {textMode ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: textBg, alignItems: "center", justifyContent: "center", padding: 28 }]}>
          <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: fontWeight, textAlign: "center", lineHeight: 40 }}>{textVal || "Type a status"}</Text>
        </View>
      ) : null}


      <EditorTopBar
        top={insets.top}
        onBack={goBack}
        onFlip={cam.flip}
        showFlip={showCamera}
        onDelete={media || textMode ? discard : null}
        canPost={canPost}
        posting={posting}
        onPost={doPost}
      />
      {recording ? (
        <View style={[s.recPill, { top: insets.top + 64 }]}>
          <View style={s.recDot} />
          <Text style={s.recText}>{fmtDur(recSec)} / 1:00</Text>
        </View>
      ) : null}
      {showCamera && !camPerm?.granted ? (
        <View style={[s.permBar, { bottom: 190 }]}>
          <Text style={s.permText}>Camera is off. You can still upload, write text, or record voice.</Text>
          <Pressable onPress={cam.needCam} style={s.permBtn} accessibilityRole="button" accessibilityLabel="Enable camera">
            <Text style={s.permBtnText}>Enable</Text>
          </Pressable>
        </View>
      ) : null}
      {!media && !textMode ? (
        <View style={[s.camBottom, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={s.camRow}>
            <Pressable onPress={cam.toggleFlash} style={s.sideBtn} accessibilityRole="button" accessibilityLabel="Toggle flash">
              <Icon name={flash === "on" ? "flash" : "flashOff"} size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={recording ? cam.stopVideo : () => cam.takePhoto(setMedia)}
              onLongPress={() => cam.startVideo(setMedia)}
              delayLongPress={400}
              style={({ pressed }) => [s.shutter, pressed && { transform: [{ scale: 0.94 }] }]}
              accessibilityRole="button"
              accessibilityLabel={recording ? "Stop recording" : "Take photo, hold for video"}
            >
              <View style={[s.shutterCore, recording && s.shutterRec]} />
            </Pressable>
            <Pressable onPress={cam.flip} style={s.sideBtn} accessibilityRole="button" accessibilityLabel="Flip camera">
              <Icon name="rotateCamera" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={s.camHint}>Tap for photo - hold for video (60s)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickRow}>
            <Pressable onPress={() => cam.pickMedia(setMedia)} style={s.pickCard} accessibilityRole="button" accessibilityLabel="Upload photo or video">
              <Icon name="image" size={22} color="#00A884" />
              <Text style={s.pickLabel}>Gallery</Text>
            </Pressable>
            <Pressable onPress={() => { Haptics.selectionAsync().catch(() => {}); setTextMode(true); }} style={s.pickCard} accessibilityRole="button" accessibilityLabel="Write text status">
              <Text style={s.pickGlyph}>Aa</Text>
              <Text style={s.pickLabel}>Text</Text>
            </Pressable>
            <Pressable onPress={() => audioSheet.current?.open?.()} style={s.pickCard} accessibilityRole="button" accessibilityLabel="Record voice status">
              <Icon name="mic" size={22} color="#00A884" />
              <Text style={s.pickLabel}>Voice</Text>
            </Pressable>
            <Pressable onPress={() => openSheet("link")} style={s.pickCard} accessibilityRole="button" accessibilityLabel="Add link">
              <Icon name="link" size={22} color="#00A884" />
      {media || textMode ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.editWrap}>
          <View style={[s.editBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {textMode ? (
              <TextInput
                value={textVal}
                onChangeText={setTextVal}
                placeholder="Type a status"
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={{ color: "#FFFFFF", fontSize: 22, fontWeight: fontWeight, textAlign: "center", paddingVertical: 8 }}
                multiline
                autoFocus
                maxLength={700}
                accessibilityLabel="Status text"
              />
            ) : (
              <View style={s.capRow}>
                <Avatar uri={myProfile?.avatar} name={myProfile?.name ?? "You"} size={34} />
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Add a caption..."
                  placeholderTextColor="rgba(255,255,255,0.65)"
                  style={s.capInput}
                  maxLength={700}
                  returnKeyType="done"
                  accessibilityLabel="Caption"
                />
                <Pressable onPress={() => openSheet("privacy")} style={s.audPill} accessibilityRole="button" accessibilityLabel="Status privacy">
                  <Icon name="users" size={14} color="#FFFFFF" />
                  <Text style={s.audText} numberOfLines={1}>{privacy}</Text>
                </Pressable>
              </View>
            )}
            {link ? (
              <View style={s.linkChip}>
                <Icon name="link" size={15} color="#00A884" />
                <Text style={s.linkText} numberOfLines={1}>{linkDomain(link)}</Text>
                <Pressable onPress={() => setLink(null)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove link">
                  <Icon name="close" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : null}
            {media?.kind === "audio" ? (
              <View style={s.audioPrev}>
                <VoiceBubble uri={media.uri} duration={media.duration ?? 0} isMine time="now" />
              </View>
            ) : null}
            {textMode ? (
              <View style={s.textTools}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.swRow}>
                  {TEXT_BGS.map((c) => (
                    <Pressable key={c} onPress={() => setTextBg(c)} style={[s.sw, { backgroundColor: c }, textBg === c && s.swOn]} accessibilityRole="button" accessibilityLabel={`Background ${c}`} />
                  ))}
                </ScrollView>
                <View style={s.toolRow}>
                  <View style={s.fontRow}>
                    {TEXT_FONTS.map((f) => (
                      <Pressable key={f.key} onPress={() => setTextFont(f.key)} style={[s.fontBtn, textFont === f.key && s.fontOn]} accessibilityRole="button" accessibilityLabel={`Font ${f.key}`}>
                        <Text style={[s.fontGlyph, { fontWeight: f.weight }, textFont === f.key && { color: "#00A884" }]}>{f.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable onPress={() => openSheet("link")} style={[s.fontBtn, link && s.fontOn]} accessibilityRole="button" accessibilityLabel="Attach link">
                    <Icon name="link" size={20} color={link ? "#00A884" : "#FFFFFF"} />
                  </Pressable>
                  <Pressable onPress={() => audioSheet.current?.open?.()} style={s.fontBtn} accessibilityRole="button" accessibilityLabel="Attach voice">
                    <Icon name="mic" size={20} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      ) : null}
      <StatusAudioSheet ref={audioSheet} onDone={onAudioDone} />
    </View>
  );
}

// Unused legacy body below is kept out of the module graph.
*/
