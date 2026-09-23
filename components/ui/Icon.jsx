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
  UserAdd01Icon,
  UserGroupIcon,
  Camera01Icon,
  Camera02Icon,
  CameraOff01Icon,
  Video01Icon,
  VideoOffIcon,
  SwitchCameraIcon,
  Image01Icon,
  Mic01Icon,
  MicOff01Icon,
  MusicNote01Icon,
  PlayIcon,
  PauseIcon,
  VolumeHighIcon,
  VolumeMute02Icon,
  SpeakerIcon,
  MuteIcon,
  RecordIcon,
  Location01Icon,
  Link01Icon,
  HashtagIcon,
  Calendar03Icon,
  Clock01Icon,
  FilterIcon,
  Call02Icon,
  CallEnd01Icon,
  AddCircleIcon,
  SmileIcon,
  ClapperboardIcon,
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
  // Share03Icon,
  // HardDriveIcon,
} from "@hugeicons/core-free-icons";

const icons = {
  home: Home05Icon,
  search: Search01Icon,
  notifications: BellIcon,
  messages: Comment02Icon,
  profile: User02Icon,
  settings: Settings01Icon,
  reels: ClapperboardIcon,

  back: ArrowLeft01Icon,
  forward: LinkForwardIcon,
  reply: LinkBackwardIcon,
  more: EllipsisIcon,
  close: Cancel01Icon,
  game: Gamepad01Icon,

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

  info: InfoIcon,
  group: Group01Icon,

  phone: Call02Icon,
  callEnd: CallEnd01Icon,
  cameraOff: CameraOff01Icon,
  videoOff: VideoOffIcon,
  switchCamera: SwitchCameraIcon,
  record: RecordIcon,

  attachment: AddCircleIcon,
  file: File02Icon,
  emoji: SmileIcon,

  spinner: LoaderCircleIcon,
  x: XIcon,
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
