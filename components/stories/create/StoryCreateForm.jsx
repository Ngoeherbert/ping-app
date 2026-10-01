import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useStoriesData } from "../../../hooks/useStoriesData";
import { TEXT_FONTS, fmtDur } from "./constants";
import { s } from "./styles";
import { EditorTopBar } from "./StoryCreateChrome";
import StoryCameraStage from "./StoryCameraStage";
import { StoryMediaCanvas } from "./StoryMediaCanvas";
import StoryEditorStage from "./StoryEditorStage";
import StoryDoneStage from "./StoryDoneStage";
import { StatusLinkSheet, StatusPrivacySheet } from "./StatusSheets";
import StatusAudioSheet from "./StatusAudioSheet";
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
  const linkSheet = useRef(null);
  const privacySheet = useRef(null);
  const audioSheet = useRef(null);

  const cam = useStoryCreateCamera({
    camPerm, requestCamPerm, micPerm, requestMicPerm,
    camRef, setFacing, setFlash, setRecording, setRecSec,
  });
  const draft = useStoryCreateDraft(cam.stopClock);
  const {
    media, setMedia, textMode, setTextMode, textVal, setTextVal,
    textBg, setTextBg, textFont, setTextFont, caption, setCaption,
    linkInput, setLinkInput, link, setLink, privacy, setPrivacy, discard,
  } = draft;
  const { posting, doPost, applyLink } = useStoryCreatePost({ onCreateStory, setPublished });

  const showCamera = !media && !textMode;
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

  const openSheet = useCallback((which) => {
    Haptics.selectionAsync().catch(() => {});
    requestAnimationFrame(() => {
      if (which === "link") linkSheet.current?.open?.();
      if (which === "privacy") privacySheet.current?.open?.();
    });
  }, []);

  const onPost = useCallback(() => {
    doPost({ media, textMode, textVal, textBg, textFont, caption, link });
  }, [caption, doPost, link, media, textBg, textFont, textMode, textVal]);

  const goView = useCallback(() => {
    setStatusBarStyle("dark");
    router.navigate("/");
  }, [router]);

  const onAudioDone = useCallback(
    (a) => setMedia({ kind: "audio", uri: a.uri, duration: Math.round(a.duration ?? 0) }),
    [setMedia]
  );

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
    <View style={s.root}>
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
        onText={() => { Haptics.selectionAsync().catch(() => {}); setTextMode(true); }}
        onVoice={() => audioSheet.current?.open?.()}
        onLink={() => openSheet("link")}
        bottom={Math.max(insets.bottom, 14)}
      />
      <StoryMediaCanvas
        media={media}
        textMode={textMode}
        textVal={textVal}
        textBg={textBg}
        fontWeight={fontWeight}
      />
      <EditorTopBar
        top={insets.top}
        onBack={goBack}
        onFlip={cam.flip}
        showFlip={showCamera}
        onDelete={media || textMode ? discard : null}
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
      {media || textMode ? (
        <StoryEditorStage
          media={media}
          textMode={textMode}
          textVal={textVal}
          setTextVal={setTextVal}
          textBg={textBg}
          setTextBg={setTextBg}
          textFont={textFont}
          setTextFont={setTextFont}
          fontWeight={fontWeight}
          caption={caption}
          setCaption={setCaption}
          myProfile={myProfile}
          privacy={privacy}
          onPrivacy={() => openSheet("privacy")}
          link={link}
          setLink={setLink}
          onLink={() => openSheet("link")}
          onVoice={() => audioSheet.current?.open?.()}
          bottom={Math.max(insets.bottom, 12)}
        />
      ) : null}
      <StatusLinkSheet
        ref={linkSheet}
        linkInput={linkInput}
        setLinkInput={setLinkInput}
        applyLink={() =>
          applyLink({
            linkInput,
            setLink,
            setLinkInput,
            close: () => linkSheet.current?.close?.(),
          })
        }
        onClose={() => {}}
      />
      <StatusPrivacySheet
        ref={privacySheet}
        privacy={privacy}
        setPrivacy={setPrivacy}
        sheetRef={privacySheet}
        onClose={() => {}}
      />
      <StatusAudioSheet ref={audioSheet} onDone={onAudioDone} />
    </View>
  );
}

