export const CONVERSATIONS = [
  {
    id: "1",
    name: "Design Crew",
    avatar: null,
    lastMessage: "Final mock is ready, review before standup",
    time: "2m",
    unreadCount: 3,
    isOnline: true,
    isMuted: false,
    isGroup: true,
    isChannel: false,
    senderName: "Adaeze",
  },
  {
    id: "2",
    name: "Kwame",
    avatar: null,
    lastMessage: "Sent a reel",
    time: "1h",
    unreadCount: 0,
    isOnline: true,
    isMuted: false,
    isGroup: false,
    isChannel: false,
    senderName: "You",
  },
  {
    id: "3",
    name: "Family Gist",
    avatar: null,
    lastMessage: "Call when you land",
    time: "3h",
    unreadCount: 1,
    isOnline: false,
    isMuted: true,
    isGroup: true,
    isChannel: false,
    senderName: "Mum",
  },
  {
    id: "4",
    name: "Ping Updates",
    avatar: null,
    lastMessage: "New reels feature is live",
    time: "1d",
    unreadCount: 5,
    isOnline: false,
    isMuted: false,
    isGroup: false,
    isChannel: true,
    senderName: "",
  },
];

export const THREADS = {
  1: [
    { id: "m1", kind: "text", message: "Morning team, designs are in", isMine: false, time: "09:12", status: null, date: "Today" },
    { id: "m2", kind: "image", uri: "https://picsum.photos/seed/ping-design/600/400", text: "Final mock is ready, review before standup", isMine: false, time: "09:14", status: null, date: "Today" },
    { id: "m3", kind: "voice", uri: null, duration: 12, isMine: false, time: "09:14", status: null, date: "Today" },
    { id: "m4", kind: "text", message: "On it, checking now", isMine: true, time: "09:15", status: "read", date: "Today" },
    { id: "m5", kind: "image", uri: "https://picsum.photos/seed/ping-snack/600/800", isMine: true, time: "09:16", status: "read", date: "Today" },
  ],
  2: [
    { id: "m1", kind: "text", message: "Yo, check this reel", isMine: false, time: "08:40", status: null, date: "Today" },
    { id: "m2", kind: "video", uri: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4", text: "Behind the scenes", duration: 10, isMine: false, time: "08:41", status: null, date: "Today" },
    { id: "m3", kind: "text", message: "Clean edit, that transition is smooth", isMine: true, time: "08:52", status: "read", date: "Today" },
  ],
  3: [
    { id: "m1", kind: "text", message: "Call when you land", isMine: false, time: "06:30", status: null, date: "Yesterday" },
    { id: "m2", kind: "file", fileName: "boarding-pass.pdf", fileSize: 184320, mimeType: "application/pdf", isMine: false, time: "06:31", status: null, date: "Yesterday" },
  ],
  4: [
    { id: "m1", kind: "text", message: "New reels feature is live. Try it out!", isMine: false, time: "Yesterday", status: null, date: "Yesterday" },
    { id: "m2", kind: "view-once", mediaType: "photo", isMine: false, time: "Yesterday", status: null, date: "Yesterday" },
  ],
};

export function getConversation(id) {
  if (!Array.isArray(CONVERSATIONS)) return undefined;
  return CONVERSATIONS.find((c) => String(c?.id) === String(id));
}

export function getThread(id) {
  if (!THREADS || typeof THREADS !== "object") return [];
  const thread = THREADS[String(id)];
  return Array.isArray(thread) ? thread : [];
}
