import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import { TEXT_BGS, TEXT_FONTS, PRIVACY } from "./constants";

export function useStoryCreateDraft(stopClock) {
  const [media, setMedia] = useState(null);
  const [textMode, setTextMode] = useState(false);
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
    setTextVal("");
    setCaption("");
    setLink(null);
    setLinkInput("");
  }, [stopClock]);

  return {
    media, setMedia,
    textMode, setTextMode,
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
