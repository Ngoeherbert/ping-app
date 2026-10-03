import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useStoriesData } from "../../../hooks/useStoriesData";
import { TEXT_BGS, TEXT_FONTS, findLink, fmtDur } from "./constants";
import { s } from "./styles";
import { EditorTopBar } from "./StoryCreateChrome";
import StoryCameraStage from "./StoryCameraStage";
import { StoryMediaCanvas } from "./StoryMediaCanvas";
import StoryEditorStage from "./StoryEditorStage";
import StoryDoneStage from "./StoryDoneStage";
import { StatusPrivacySheet } from "./StatusSheets";
import StoryTextArea from "./StoryTextArea";
import useVoiceRecorder from "../../messages/useVoiceRecorder";
import { useStoryCreateDraft } from "./useStoryCreateDraft";
import { useStoryCreateCamera } from "./useStoryCreateCamera";
import { useStoryCreatePost } from "./useStoryCreatePost";

export default function StoryCreateForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { myProfile, onCreateStory } = useStoriesData();
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [focused, setFocused] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [published, setPublished] = useState(false);
  const camRef = useRef(null);
  const privacySheet = useRef(null);
  const cam = useStoryCreateCamera({
    camPerm, requestCamPerm, micPerm, requestMicPerm,
    camRef, setFacing, setFlash, setRecording, setRecSec,
  });
  const draft = useStoryCreateDraft(cam.stopClock);
  const {
    media, setMedia, textMode, setTextMode, voiceMode, setVoiceMode, textVal, setTextVal,
    textBg, setTextBg, textFont, setTextFont, caption, setCaption,
    link, setLink, privacy, setPrivacy, discard,
  } = draft;
  const { posting, doPost } = useStoryCreatePost({ onCreateStory, setPublished });

  // A text story that mentions a link picks it up automatically as you type, so
  // there's no link modal to open. Re-runs on every keystroke.
  useEffect(() => {
    setLink(findLink(textVal));
  }, [textVal, setLink]);

  // The voice screen mirrors the text status screen, so the camera stands down.
  const showCamera = !media && !textMode && !voiceMode;
  const canPost = !!media || (textMode && textVal.trim().length > 0);
  const fontWeight = useMemo(
    () => TEXT_FONTS.find((f) => f.key === textFont)?.weight ?? "700",
    [textFont]
  );

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      setStatusBarStyle("light");
      return () => setFocused(false);
    }, [])
  );
  useEffect(() => () => cam.stopClock(), [cam]);

  const goBack = useCallback(() => {
    if (media || textMode) discard();
    setStatusBarStyle("dark");
    router.back();
  }, [discard, media, router, textMode]);

  const openPrivacy = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    requestAnimationFrame(() => {
      privacySheet.current?.open?.();
    });
  }, []);

  // Palette button: jump the text story's background to a different random colour.
  // Uses the functional setter so back-to-back taps never land on the same
  // colour twice in a row.
  const shuffleTextBg = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setTextBg((current) => {
      const others = TEXT_BGS.filter((c) => c !== current);
      const pool = others.length ? others : TEXT_BGS;
      return pool[Math.floor(Math.random() * pool.length)];
    });
  }, [setTextBg]);

  // Text-style counterpart to the palette button: jumps the story's font to a
  // different random one, same "always visibly changes" rule as the background.
  const shuffleTextFont = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setTextFont((current) => {
      const others = TEXT_FONTS.filter((f) => f.key !== current);
      const pool = others.length ? others : TEXT_FONTS;
      return pool[Math.floor(Math.random() * pool.length)].key;
    });
  }, [setTextFont]);

  const onPost = useCallback(() => {
    doPost({ media, textMode, textVal, textBg, textFont, caption, link });
  }, [caption, doPost, link, media, textBg, textFont, textMode, textVal]);

  const goView = useCallback(() => {
    setStatusBarStyle("dark");
    router.navigate("/my-stories");
  }, [router]);

  // Tapping anywhere outside the focused field closes the keyboard. The root is
  // a Pressable so this catches taps that land on the canvas, camera or top bar
  // — RN only auto-dismisses for taps inside a ScrollView.
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  // Voice notes are recorded inline in the text area — no separate sheet.
  const recorder = useVoiceRecorder({
    onRecorded: (t) => {
      setMedia({ kind: "audio", uri: t.uri, duration: t.duration ?? 0 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
  });
  // Voice tab opens the voice composer — the text status screen, adapted for
  // voice. It does NOT start recording; the mic on that screen does.
  const openVoiceMode = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setTextMode(false);
    setVoiceMode(true);
  }, [setTextMode, setVoiceMode]);

  // Tapping the mic on the voice screen starts/stops the take.
  const toggleVoiceNote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (recorder.recording) {
      recorder.stop();
      return;
    }
    // A voice note replaces whatever else the story held.
    setMedia(null);
    setTextMode(false);
    recorder.start();
  }, [recorder, setMedia, setTextMode]);
  const voiceTake = media?.kind === "audio" ? { uri: media.uri, duration: media.duration } : null;

  // Discard the take and drop back to the empty voice screen, where the record
  // control reappears so it can be recorded again.
  const deleteVoiceNote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setMedia(null);
  }, [setMedia]);

  if (published) {
    return (
      <StoryDoneStage
        top={insets.top}
        privacy={privacy}
        onView={goView}
        onAgain={() => { setPublished(false); discard(); }}
      />
    );
  }

  return (
    // accessible={false} keeps this from becoming a screen-reader element — it
    // exists only to catch outside taps. Child pressables still win the tap.
    <Pressable style={s.root} onPress={dismissKeyboard} accessible={false}>
      <StoryCameraStage
        camRef={camRef}
        facing={facing}
        flash={flash}
        focused={focused}
        showCamera={showCamera}
        camPerm={camPerm}
        needCam={cam.needCam}
        toggleFlash={cam.toggleFlash}
        flip={cam.flip}
        recording={recording}
        recSec={recSec}
        stopVideo={cam.stopVideo}
        takePhoto={() => cam.takePhoto(setMedia)}
        startVideo={() => cam.startVideo(setMedia)}
        pickMedia={() => cam.pickMedia(setMedia)}
        onText={() => { Haptics.selectionAsync().catch(() => {}); setVoiceMode(false); setTextMode(true); }}
        onVoice={openVoiceMode}
        bottom={Math.max(insets.bottom, 14)}
      />
      <StoryMediaCanvas media={media} textMode={textMode} voiceMode={voiceMode} textBg={textBg} />
      {/* One centred surface: the text status screen and the voice screen. */}
      {textMode || voiceMode || voiceTake || recorder.recording ? (
        <StoryTextArea
          textMode={textMode}
          textVal={textVal}
          setTextVal={setTextVal}
          fontWeight={fontWeight}
          voiceMode={voiceMode}
          take={voiceTake}
          recording={recorder.recording}
          recordingSec={Math.floor(recorder.durationMillis / 1000)}
          onToggleRecord={toggleVoiceNote}
          onDeleteTake={deleteVoiceNote}
        />
      ) : null}
      <EditorTopBar
        top={insets.top}
        onBack={goBack}
        onFlip={cam.flip}
        showFlip={showCamera}
        onStyle={textMode ? shuffleTextFont : null}
        onShuffle={shuffleTextBg}
        canPost={canPost}
        posting={posting}
        onPost={onPost}
      />
      {recording ? (
        <View style={[s.recPill, { top: insets.top + 64 }]}>
          <View style={s.recDot} />
          <Text style={s.recText}>{fmtDur(recSec)} / 1:00</Text>
        </View>
      ) : null}
      {media || textMode || voiceMode ? (
        <StoryEditorStage
          textMode={textMode}
          voiceMode={voiceMode}
          caption={caption}
          setCaption={setCaption}
          myProfile={myProfile}
          privacy={privacy}
          onPrivacy={openPrivacy}
          link={link}
          setLink={setLink}
          bottom={Math.max(insets.bottom, 12)}
        />
      ) : null}
      <StatusPrivacySheet
        ref={privacySheet}
        privacy={privacy}
        setPrivacy={setPrivacy}
        sheetRef={privacySheet}
        onClose={() => {}}
      />
    </Pressable>
  );
}

