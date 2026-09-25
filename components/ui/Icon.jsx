import React from "react";
import { HugeiconsIcon } from "@hugeicons/react-native";

import {
  Home05Icon,
  Search01Icon,
  BellIcon,
  Comment02Icon,
  User02Icon,
  Settings01Icon,
  ArrowLeft01Icon,
  LinkForwardIcon,
  Cancel01Icon,
  Add01Icon,
  Tick01Icon,
  PencilEdit02Icon,
  Delete02Icon,
  Share08Icon,
  SentIcon,
  Bookmark01Icon,
  Download01Icon,
  HeartIcon,
  Comment01Icon,
  UserGroupIcon,
  Camera01Icon,
  UserAdd01Icon,
  VideoOffIcon,
  Video01Icon,
  CameraRotated01Icon,
  Image01Icon,
  Mic01Icon,
  MicOff01Icon,
  MusicNote01Icon,
  PlayIcon,
  PauseIcon,
  VolumeHighIcon,
  SpeakerIcon,
  MuteIcon,
  RecordIcon,
  Call02Icon,
  CallEnd01Icon,
  AddCircleIcon,
  SmileIcon,
  PlayListIcon,
  AudioLinesIcon,
  ClockFadingIcon,
  File02Icon,
  LinkBackwardIcon,
  Copy01Icon,
  KeyboardIcon,
  KeyboardOffIcon,
  Gamepad01Icon,
  StarIcon,
  AiTranslateIcon,
  EllipsisIcon,
  InfoIcon,
  Group01Icon,
  LoaderCircleIcon,
  XIcon,
  PictureInPicture01Icon,
  PictureInPictureExitIcon,
  SparklesIcon,
  Location01Icon,
  CircleSlashIcon,
  CopyPlusIcon,
} from "@hugeicons/core-free-icons";

const icons = {
  home: Home05Icon,
  search: Search01Icon,
  notifications: BellIcon,
  messages: Comment02Icon,
  profile: User02Icon,
  settings: Settings01Icon,
  reels: PlayListIcon,

  back: ArrowLeft01Icon,
  forward: LinkForwardIcon,
  reply: LinkBackwardIcon,
  more: EllipsisIcon,
  close: Cancel01Icon,

  plus: Add01Icon,
  check: Tick01Icon,
  edit: PencilEdit02Icon,
  delete: Delete02Icon,
  share: Share08Icon,
  send: SentIcon,
  bookmark: Bookmark01Icon,
  star: StarIcon,
  download: Download01Icon,
  copy: Copy01Icon,
  translate: AiTranslateIcon,

  heart: HeartIcon,
  comment: Comment01Icon,
  follow: UserAdd01Icon,
  addUser: UserAdd01Icon,
  users: UserGroupIcon,
  user: User02Icon,

  camera: Camera01Icon,
  video: Video01Icon,
  image: Image01Icon,
  microphone: Mic01Icon,
  micOff: MicOff01Icon,
  soundWave: AudioLinesIcon,
  music: MusicNote01Icon,
  play: PlayIcon,
  pause: PauseIcon,
  volume: VolumeHighIcon,
  mute: MuteIcon,
  speaker: SpeakerIcon,
  viewOnce: ClockFadingIcon,
  keyboard: KeyboardIcon,
  keyboardHide: KeyboardOffIcon,
  flipPiP: PictureInPicture01Icon,
  flipPiPExit: PictureInPictureExitIcon,

  info: InfoIcon,
  group: Group01Icon,

  phone: Call02Icon,
  callEnd: CallEnd01Icon,
  cameraOff: VideoOffIcon,
  videoOff: VideoOffIcon,
  rotateCamera: CameraRotated01Icon,
  record: RecordIcon,
  sparkle: SparklesIcon,

  attachment: AddCircleIcon,
  addMultiple: CopyPlusIcon,
  file: File02Icon,
  emoji: SmileIcon,
  location: Location01Icon,
  game: Gamepad01Icon,

  spinner: LoaderCircleIcon,
  x: XIcon,

  // filter icons
  none: CircleSlashIcon,
};

export default function Icon({
  name,
  size = 24,
  color = "#000000",
  strokeWidth = 1.5,
  ...props
}) {
  const icon = icons[name];

  if (!icon) {
    console.warn(`[Icon] Unknown icon: "${name}"`);
    return null;
  }

  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
