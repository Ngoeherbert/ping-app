import { Dimensions } from "react-native";

/**
 * Shared media tile sizing for gist bubbles.
 * ImageBubble and VideoBubble must stay pixel-identical, so both read
 * their dimensions from here instead of hardcoding their own numbers.
 */
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_MEDIA_WIDTH = 230;
const MIN_MEDIA_WIDTH = 180;

// Leave room for the thread row padding and the group-avatar gutter.
export const MEDIA_WIDTH = Math.min(
  MAX_MEDIA_WIDTH,
  Math.max(MIN_MEDIA_WIDTH, SCREEN_WIDTH - 60),
);
export const MEDIA_HEIGHT = Math.round((MEDIA_WIDTH / MAX_MEDIA_WIDTH) * 280);

/** Horizontal padding a caption keeps to line up with bubble padding. */
export const CAPTION_PAD_H = 13;
