import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import { TEXT_BGS, TEXT_FONTS, PRIVACY } from "./constants";

export function useStoryCreateDraft(stopClock) {
  const [media, setMedia] = useState(null);
  const [textMode, setTextMode] = useState(false);
  // Voice stories get their own composer screen, which reuses the text status
  // layout. Kept separate from `media.kind === "audio"` so entering the screen
  // doesn't start a recording on its own.
  const [voiceMode, setVoiceMode] = useState(false);
  const [textVal, setTextVal] = useState("");
  const [textBg, setTextBg] = useState(TEXT_BGS[0]);
  const [textFont, setTextFont] = useState(TEXT_FONTS[1].key);
  const [caption, setCaption] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [link, setLink] = useState(null);
  const [privacy, setPrivacy] = useState(PRIVACY[0]);

  const discard = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    stopClock?.();
    setMedia(null);
    setTextMode(false);
    setVoiceMode(false);
    setTextVal("");
    setCaption("");
    setLink(null);
    setLinkInput("");
  }, [stopClock]);

  return {
    media, setMedia,
    textMode, setTextMode,
    voiceMode, setVoiceMode,
    textVal, setTextVal,
    textBg, setTextBg,
    textFont, setTextFont,
    caption, setCaption,
    linkInput, setLinkInput,
    link, setLink,
    privacy, setPrivacy,
    discard,
  };
}
