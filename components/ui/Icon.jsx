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
  ArrowRight01Icon,
  MoreHorizontalIcon,
  Cancel01Icon,
  Add01Icon,
  Tick01Icon,
  Edit02Icon,
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
  Video01Icon,
  Image01Icon,
  Mic01Icon,
  MusicNote01Icon,
  PlayIcon,
  PauseIcon,
  VolumeHighIcon,
  VolumeMute02Icon,
  Location01Icon,
  Link01Icon,
  HashtagIcon,
  Calendar03Icon,
  Clock01Icon,
  FilterIcon,
  Call02Icon,
  AddCircleIcon,
  SmileIcon,
  ClapperboardIcon,
  AudioLinesIcon,
  ClockFadingIcon,
  File02Icon,
  KeyboardIcon,
  KeyboardOffIcon,
  Gamepad01Icon,
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
  forward: ArrowRight01Icon,
  more: MoreHorizontalIcon,
  close: Cancel01Icon,
  game: Gamepad01Icon,

  plus: Add01Icon,
  check: Tick01Icon,
  edit: Edit02Icon,
  delete: Delete02Icon,
  share: Share08Icon,
  send: SentIcon,
  bookmark: Bookmark01Icon,
  download: Download01Icon,

  heart: HeartIcon,
  comment: Comment01Icon,
  follow: UserAdd01Icon,
  users: UserGroupIcon,
  user: User02Icon,

  camera: Camera01Icon,
  video: Video01Icon,
  image: Image01Icon,
  microphone: Mic01Icon,
  soundWave: AudioLinesIcon,
  music: MusicNote01Icon,
  play: PlayIcon,
  pause: PauseIcon,
  volume: VolumeHighIcon,
  mute: VolumeMute02Icon,
  viewOnce: ClockFadingIcon,
  keyboard: KeyboardIcon,
  keyboardHide: KeyboardOffIcon,

  location: Location01Icon,
  link: Link01Icon,
  hashtag: HashtagIcon,
  calendar: Calendar03Icon,
  clock: Clock01Icon,
  filter: FilterIcon,

  phone: Call02Icon,
  attachment: AddCircleIcon,
  file: File02Icon,
  emoji: SmileIcon,
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
