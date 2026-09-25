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
    members: [
      { id: "adaeze", name: "Adaeze", avatar: null },
      { id: "kwame", name: "Kwame", avatar: null },
      { id: "yemi", name: "Yemi", avatar: null },
      { id: "you", name: "You", avatar: null },
    ],
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
    members: [
      { id: "mum", name: "Mum", avatar: null },
      { id: "you", name: "You", avatar: null },
    ],
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
    { id: "m1", kind: "text", message: "Morning team, designs are in", senderId: "adaeze", sender: { name: "Adaeze", avatar: null }, isMine: false, time: "09:12", status: null, date: "Today" },
    { id: "m2", kind: "image", uri: "https://picsum.photos/seed/ping-design/600/400", text: "Final mock is ready, review before standup", senderId: "kwame", sender: { name: "Kwame", avatar: null }, isMine: false, time: "09:14", status: null, date: "Today" },
    { id: "m3", kind: "voice", uri: null, duration: 12, senderId: "yemi", sender: { name: "Yemi", avatar: null }, isMine: false, time: "09:14", status: null, date: "Today" },
    { id: "m4", kind: "text", message: "I can review the spacing after standup", senderId: "yemi", sender: { name: "Yemi", avatar: null }, isMine: false, time: "09:17", status: null, date: "Today" },
    { id: "m5", kind: "text", message: "On it, checking now", senderId: "you", sender: { name: "You", avatar: null }, isMine: true, time: "09:15", status: "read", date: "Today" },
    { id: "m6", kind: "image", uri: "https://picsum.photos/seed/ping-snack/600/800", senderId: "you", sender: { name: "You", avatar: null }, isMine: true, time: "09:16", status: "read", date: "Today" },
  ],
  2: [
    { id: "m1", kind: "text", message: "Yo, check this reel", isMine: false, time: "08:40", status: null, date: "Today" },
    { id: "m2", kind: "video", uri: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4", text: "Behind the scenes", duration: 10, isMine: false, time: "08:41", status: null, date: "Today" },
    { id: "m3", kind: "text", message: "Clean edit, that transition is smooth", isMine: true, time: "08:52", status: "read", date: "Today" },
  ],
  3: [
    { id: "m1", kind: "text", message: "Call when you land", senderId: "mum", sender: { name: "Mum", avatar: null }, isMine: false, time: "06:30", status: null, date: "Yesterday" },
    { id: "m2", kind: "file", fileName: "boarding-pass.pdf", fileSize: 184320, mimeType: "application/pdf", senderId: "mum", sender: { name: "Mum", avatar: null }, isMine: false, time: "06:31", status: null, date: "Yesterday" },
  ],
  4: [
    { id: "m1", kind: "text", message: "New reels feature is live. Try it out!", isMine: false, time: "Yesterday", status: null, date: "Yesterday" },
    { id: "m2", kind: "view-once", mediaType: "photo", uri: "https://picsum.photos/seed/ping-view-once/600/800", isMine: false, time: "Yesterday", status: null, date: "Yesterday" },
  ],
};

export function getConversation(id) {
  if (!Array.isArray(CONVERSATIONS)) return undefined;
  return CONVERSATIONS.find((c) => String(c?.id) === String(id));
}

export function resolveMessageSender(message, conversation) {
  const rawSender = message?.sender ?? message?.user ?? message?.userProfile ?? message?.profile ?? message?.author;
  const senderId = message?.senderId ?? message?.userId ?? message?.authorId ?? (
    typeof rawSender === "object" ? rawSender?.id ?? rawSender?.userId : null
  );
  const members = conversation?.members ?? conversation?.participants ?? conversation?.users;
  const member = Array.isArray(members)
    ? members.find((entry) => String(entry?.id) === String(senderId))
    : undefined;
  const rawName = typeof rawSender === "string"
    ? rawSender
    : rawSender?.name ?? rawSender?.displayName ?? rawSender?.fullName ?? message?.senderName;
  const memberName = member?.name ?? member?.displayName ?? member?.fullName;
  const rawAvatar = typeof rawSender === "object"
    ? rawSender?.avatar ?? rawSender?.avatarUri ?? rawSender?.photoURL ?? rawSender?.image ?? message?.senderAvatar
    : message?.senderAvatar;
  const isGenericName = !rawName || String(rawName).trim().toLowerCase() === "member";
  const name = isGenericName ? memberName ?? null : rawName;

  return {
    id: senderId ?? member?.id ?? name ?? null,
    name,
    avatar: rawAvatar ?? member?.avatar ?? null,
  };
}
export function messageSenderKey(message, conversation) {
  const sender = resolveMessageSender(message, conversation);
  if (sender.id != null) return `id:${String(sender.id)}`;
  if (sender.name) return `name:${sender.name.trim().toLowerCase()}`;
  return null;
}

export function getThread(id) {
  if (!THREADS || typeof THREADS !== "object") return [];
  const thread = THREADS[String(id)];
  return Array.isArray(thread) ? thread : [];
}
