// ============== CORE CONSTANTS ==============
export const MY_AVATAR = "https://picsum.photos/seed/me/120/120";
export const MY_USER_ID = "me";
export const MY_NAME = "You";
export const MY_HANDLE = "@you";
export const MY_BIO = "Just a ping away.";
export const MY_LOCATION = "Lagos, Nigeria";

// ============== VERIFIED VARIANTS ==============
export const VERIFIED_VARIANTS = ["blue", "dark", "white", "gold"];
export const VERIFIED_BLUE = "#1D9BF0";
export const VERIFIED_GOLD = "#FFD700";
export const LIKE_PINK = "#F0407F";
export const RING_PINK = "#F2A7C6";
export const TAG_BLUE = "#2F80ED";
export const SEE_MORE_LIMIT = 90;

// ============== USER PROFILES ==============
export const USER_PROFILES = {
  "1": {
    id: "1",
    name: "Adaeze O.",
    handle: "@adaeze",
    avatar: "https://picsum.photos/seed/adaeze/120/120",
    verified: false,
    verifiedVariant: "blue",
    bio: "Designer & weekend explorer",
    location: "Lagos, Nigeria",
    followers: 1240,
    following: 890,
    pings: 248,
  },
  "2": {
    id: "2",
    name: "Kwame M.",
    handle: "@kwame",
    avatar: "https://picsum.photos/seed/kwame/120/120",
    verified: true,
    verifiedVariant: "blue",
    bio: "Content creator | Lagos",
    location: "Lagos, Nigeria",
    followers: 12400,
    following: 320,
    pings: 1892,
  },
  "3": {
    id: "3",
    name: "Family Gist",
    handle: "@family",
    avatar: null,
    verified: false,
    verifiedVariant: "blue",
    bio: "Family group chat",
    location: null,
    followers: 4,
    following: 4,
    pings: 0,
  },
  "4": {
    id: "4",
    name: "Ping Team",
    handle: "@ping",
    avatar: "https://picsum.photos/seed/pingteam/120/120",
    verified: true,
    verifiedVariant: "gold",
    bio: "The team behind Ping",
    location: null,
    followers: 50000,
    following: 0,
    pings: 1024,
  },
  "5": {
    id: "5",
    name: "Yemi A.",
    handle: "@yemi",
    avatar: "https://picsum.photos/seed/yemi/120/120",
    verified: false,
    verifiedVariant: "blue",
    bio: "Photographer capturing moments",
    location: "Abuja, Nigeria",
    followers: 890,
    following: 420,
    pings: 156,
  },
  "6": {
    id: "6",
    name: "Sarah K.",
    handle: "@sarahk",
    avatar: "https://picsum.photos/seed/sarah/120/120",
    verified: true,
    verifiedVariant: "white",
    bio: "Traveler & foodie",
    location: "London, UK",
    followers: 45600,
    following: 180,
    pings: 3402,
  },
  "7": {
    id: "7",
    name: "Dev Center",
    handle: "@devcenter",
    avatar: "https://picsum.photos/seed/devcenter/120/120",
    verified: true,
    verifiedVariant: "blue",
    bio: "Engineering blog & updates",
    location: "Remote",
    followers: 8900,
    following: 12,
    pings: 523,
  },
  "8": {
    id: "8",
    name: "Music Vibes",
    handle: "@musicvibes",
    avatar: "https://picsum.photos/seed/musicvibes/120/120",
    verified: false,
    verifiedVariant: "dark",
    bio: "Daily music updates",
    location: "Lagos, Nigeria",
    followers: 3400,
    following: 56,
    pings: 892,
  },
  "9": {
    id: "9",
    name: "Foodie",
    handle: "@foodie",
    avatar: "https://picsum.photos/seed/foodie/120/120",
    verified: false,
    verifiedVariant: "blue",
    bio: "Eating my way across West Africa",
    location: "Accra, Ghana",
    followers: 2100,
    following: 310,
    pings: 421,
  },
  "10": {
    id: "10",
    name: "Travel Diaries",
    handle: "@traveldiaries",
    avatar: "https://picsum.photos/seed/travel/120/120",
    verified: true,
    verifiedVariant: "blue",
    bio: "Documenting every border crossing",
    location: "Nairobi, Kenya",
    followers: 28400,
    following: 145,
    pings: 1204,
  },
  "11": {
    id: "11",
    name: "Tech News",
    handle: "@technews",
    avatar: "https://picsum.photos/seed/technews/120/120",
    verified: true,
    verifiedVariant: "gold",
    bio: "The stories behind the silicon",
    location: null,
    followers: 61200,
    following: 88,
    pings: 2760,
  },
};

// ============== FRIENDS ==============
export const FRIENDS = [
  { id: "1", name: "Adaeze O.", handle: "@adaeze", avatar: "https://picsum.photos/seed/adaeze/120/120", verified: false, isOnline: true, lastSeen: null },
  { id: "2", name: "Kwame M.", handle: "@kwame", avatar: "https://picsum.photos/seed/kwame/120/120", verified: true, verifiedVariant: "blue", isOnline: true, lastSeen: null },
  { id: "5", name: "Yemi A.", handle: "@yemi", avatar: "https://picsum.photos/seed/yemi/120/120", verified: false, isOnline: false, lastSeen: "2h ago" },
  { id: "6", name: "Sarah K.", handle: "@sarahk", avatar: "https://picsum.photos/seed/sarah/120/120", verified: true, verifiedVariant: "white", isOnline: true, lastSeen: null },
  { id: "7", name: "Dev Center", handle: "@devcenter", avatar: "https://picsum.photos/seed/devcenter/120/120", verified: true, verifiedVariant: "blue", isOnline: false, lastSeen: "1d ago" },
  { id: "8", name: "Music Vibes", handle: "@musicvibes", avatar: "https://picsum.photos/seed/musicvibes/120/120", verified: false, verifiedVariant: "dark", isOnline: true, lastSeen: null },
  { id: "9", name: "Foodie", handle: "@foodie", avatar: "https://picsum.photos/seed/foodie/120/120", verified: false, isOnline: true, lastSeen: null },
  { id: "10", name: "Travel Diaries", handle: "@traveldiaries", avatar: "https://picsum.photos/seed/travel/120/120", verified: true, verifiedVariant: "blue", isOnline: false, lastSeen: "3h ago" },
];

// ============== FOLLOWINGS & FOLLOWERS ==============
export const FOLLOWINGS = [
  { id: "1", name: "Adaeze O.", handle: "@adaeze", avatar: "https://picsum.photos/seed/adaeze/120/120", verified: false },
  { id: "2", name: "Kwame M.", handle: "@kwame", avatar: "https://picsum.photos/seed/kwame/120/120", verified: true, verifiedVariant: "blue" },
  { id: "5", name: "Yemi A.", handle: "@yemi", avatar: "https://picsum.photos/seed/yemi/120/120", verified: false },
  { id: "7", name: "Dev Center", handle: "@devcenter", avatar: "https://picsum.photos/seed/devcenter/120/120", verified: true, verifiedVariant: "blue" },
  { id: "8", name: "Music Vibes", handle: "@musicvibes", avatar: "https://picsum.photos/seed/musicvibes/120/120", verified: false, verifiedVariant: "dark" },
];

export const FOLLOWERS = [
  { id: "5", name: "Yemi A.", handle: "@yemi", avatar: "https://picsum.photos/seed/yemi/120/120", verified: false },
  { id: "6", name: "Sarah K.", handle: "@sarahk", avatar: "https://picsum.photos/seed/sarah/120/120", verified: true, verifiedVariant: "white" },
  { id: "9", name: "Foodie", handle: "@foodie", avatar: "https://picsum.photos/seed/foodie/120/120", verified: false },
  { id: "10", name: "Travel Diaries", handle: "@traveldiaries", avatar: "https://picsum.photos/seed/travel/120/120", verified: true, verifiedVariant: "blue" },
  { id: "11", name: "Tech News", handle: "@technews", avatar: "https://picsum.photos/seed/technews/120/120", verified: true, verifiedVariant: "gold" },
];

// ============== STORIES ==============
function STORY_AV(n) {
  return `https://picsum.photos/seed/story-av-${n}/80/80`;
}
function STORY_C(n) {
  return `https://picsum.photos/seed/story-${n}/240/320`;
}

export const STORIES = [
  // Your own stories come first so the row (and viewer navigation order) leads
  // with your card. They are grouped into a single tile by StoriesRow and the
  // My Stories screen manages them. Each carries a `views` list for reporting.
  { id: "sm1", userId: MY_USER_ID, avatar: MY_AVATAR, cover: STORY_C(99), seen: false, kind: "image", caption: "Morning run 🌅", time: "2h ago", mine: true },
  { id: "sm2", userId: MY_USER_ID, avatar: MY_AVATAR, cover: STORY_C(100), seen: true, kind: "text", text: "Coffee & code ☕", bg: "#5B57FF", font: "bold", time: "1d ago", mine: true },
  { id: "s1", userId: "1", avatar: STORY_AV(1), cover: STORY_C(1), seen: false },
  { id: "s2", userId: "2", avatar: STORY_AV(2), cover: STORY_C(2), seen: false },
  { id: "s3", userId: "5", avatar: STORY_AV(3), cover: STORY_C(3), seen: true },
  { id: "s4", userId: "6", avatar: STORY_AV(4), cover: STORY_C(4), seen: true },
  { id: "s5", userId: "8", avatar: STORY_AV(5), cover: STORY_C(5), seen: true },
  { id: "s6", userId: "10", avatar: STORY_AV(6), cover: STORY_C(6), seen: false },
];

// ============== STORY VIEWERS ==============
// Viewers are attached to a story by id. `getStoryViewers` is the single
// accessor the store and screens use so mock data is easy to find/extend.
function storyViewer(id, name, handle, avatar, time, verified = false, variant = "blue") {
  return { userId: String(id), name, handle, avatar, verified, verifiedVariant: variant, time };
}

export const STORY_VIEWS = {
  s1: [
    storyViewer("5", "Yemi A.", "@yemi", "https://picsum.photos/seed/yemi/120/120", "2h ago"),
    storyViewer("8", "Music Vibes", "@musicvibes", "https://picsum.photos/seed/musicvibes/120/120", "1h ago"),
    storyViewer("6", "Sarah K.", "@sarahk", "https://picsum.photos/seed/sarah/120/120", "30m ago", true, "white"),
    storyViewer("10", "Travel Diaries", "@traveldiaries", "https://picsum.photos/seed/travel/120/120", "15m ago", true, "blue"),
    storyViewer("9", "Foodie", "@foodie", "https://picsum.photos/seed/foodie/120/120", "5m ago"),
  ],
  s2: [
    storyViewer("1", "Adaeze O.", "@adaeze", "https://picsum.photos/seed/adaeze/120/120", "3h ago"),
    storyViewer("7", "Dev Center", "@devcenter", "https://picsum.photos/seed/devcenter/120/120", "2h ago", true, "blue"),
    storyViewer("9", "Foodie", "@foodie", "https://picsum.photos/seed/foodie/120/120", "45m ago"),
  ],
  sm1: [
    storyViewer("2", "Kwame M.", "@kwame", "https://picsum.photos/seed/kwame/120/120", "now", true, "blue"),
    storyViewer("6", "Sarah K.", "@sarahk", "https://picsum.photos/seed/sarah/120/120", "just now", true, "white"),
    storyViewer("9", "Foodie", "@foodie", "https://picsum.photos/seed/foodie/120/120", "just now"),
  ],
};

const EMPTY_VIEWERS = [];

export function getStoryViewers(storyId) {
  return STORY_VIEWS[String(storyId)] ?? EMPTY_VIEWERS;
}

// Reactions are tracked separately from views so the activity sheet can list
// who watched and who responded, and so one person can appear in both.
export const STORY_REACTIONS = {
  sm1: [
    storyViewer("6", "Sarah K.", "@sarahk", "https://picsum.photos/seed/sarah/120/120", "just now", true, "white"),
    storyViewer("9", "Foodie", "@foodie", "https://picsum.photos/seed/foodie/120/120", "just now"),
  ],
  sm2: [
    storyViewer("2", "Kwame M.", "@kwame", "https://picsum.photos/seed/kwame/120/120", "1h ago", true, "blue"),
  ],
};

export function getStoryReactions(storyId) {
  return STORY_REACTIONS[String(storyId)] ?? EMPTY_VIEWERS;
}

// ============== FEED POSTS (BASE) ==============
export const BASE_PINGS = [
  {
    id: "1",
    userId: "1",
    user: "Adaeze O.",
    handle: "@adaeze",
    avatar: "https://picsum.photos/seed/adaeze/120/120",
    time: "2m ago",
    text: "Who's at the beach house this weekend? Bringing snacks, a speaker and far too many board games for one evening.",
    tags: ["weekend", "beachhouse"],
    likes: 24,
    replies: 8,
    liked: false,
    verified: false,
    verifiedVariant: "blue",
    showFollow: true,
    tagged: [],
    media: null,
  },
  {
    id: "2",
    userId: "2",
    user: "Kwame M.",
    handle: "@kwame",
    avatar: "https://picsum.photos/seed/kwame/120/120",
    time: "18m ago",
    text: "Just dropped a new reel - behind the scenes from Lagos.",
    tags: ["travel", "lagos", "reel"],
    likes: 112,
    replies: 31,
    liked: true,
    verified: true,
    verifiedVariant: "blue",
    showFollow: false,
    tagged: [
      "https://picsum.photos/seed/tag-a/80/80",
      "https://picsum.photos/seed/tag-b/80/80",
    ],
    media: {
      type: "video",
      uri: "https://picsum.photos/seed/ping-reel/600/520",
      duration: "0:32",
    },
  },
  {
    id: "3",
    userId: "4",
    user: "Ping Team",
    handle: "@ping",
    avatar: "https://picsum.photos/seed/pingteam/120/120",
    time: "1h ago",
    text: "Welcome to Ping. Say hi with your first ping.",
    tags: ["welcome", "ping"],
    likes: 300,
    replies: 95,
    liked: false,
    verified: true,
    verifiedVariant: "gold",
    showFollow: true,
    tagged: [],
    media: {
      type: "image",
      uri: "https://picsum.photos/seed/ping-welcome/600/600",
    },
  },
];

// ============== REELS ==============
export const REELS = [
  {
    id: "r1",
    userId: "5",
    user: "Yemi A.",
    handle: "@yemi",
    avatar: "https://picsum.photos/seed/yemi/120/120",
    verified: false,
    videoUri:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    cover: "https://picsum.photos/seed/reel-1-cover/400/700",
    duration: "0:15",
    description: "Golden hour in Abuja 🌅 #sunset #nigeria",
    views: 12400,
    likes: 892,
    comments: 43,
    shares: 67,
    reposts: 132,
    liked: false,
    music: "Golden Hour - Yemi",
    isSaved: false,
  },
  {
    id: "r2",
    userId: "2",
    user: "Kwame M.",
    handle: "@kwame",
    avatar: "https://picsum.photos/seed/kwame/120/120",
    verified: true,
    verifiedVariant: "blue",
    videoUri:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    cover: "https://picsum.photos/seed/reel-2-cover/400/700",
    duration: "0:32",
    description: "Behind the scenes from Lagos. The city never sleeps.",
    views: 9800,
    likes: 2104,
    comments: 89,
    shares: 123,
    reposts: 214,
    liked: true,
    music: "Lagos Nights - Kwame",
    isSaved: true,
  },
  {
    id: "r3",
    userId: "8",
    user: "Music Vibes",
    handle: "@musicvibes",
    avatar: "https://picsum.photos/seed/musicvibes/120/120",
    verified: false,
    verifiedVariant: "dark",
    videoUri:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    cover: "https://picsum.photos/seed/reel-3-cover/400/700",
    duration: "0:45",
    description: "New drop is live now! 🎧 #newmusic #afrobeats",
    views: 15600,
    likes: 567,
    comments: 31,
    shares: 42,
    reposts: 76,
    liked: false,
    music: "Afrobeats Vibes - Music Vibes",
    isSaved: false,
  },
  {
    id: "r4",
    userId: "1",
    user: "Adaeze O.",
    handle: "@adaeze",
    avatar: "https://picsum.photos/seed/adaeze/120/120",
    verified: false,
    videoUri:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    cover: "https://picsum.photos/seed/reel-4-cover/400/700",
    duration: "0:22",
    description: "Studio day. New set loading 🎧 #design #lagos",
    views: 21400,
    likes: 1310,
    comments: 76,
    shares: 54,
    reposts: 187,
    liked: false,
    music: "Studio Sessions - Adaeze",
    isSaved: false,
  },
  {
    id: "r5",
    userId: "6",
    user: "Sarah K.",
    handle: "@sarahk",
    avatar: "https://picsum.photos/seed/sarah/120/120",
    verified: true,
    verifiedVariant: "white",
    videoUri:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    cover: "https://picsum.photos/seed/reel-5-cover/400/700",
    duration: "0:18",
    description: "Morning routine that actually works ☀️ #wellness",
    views: 7300,
    likes: 486,
    comments: 21,
    shares: 19,
    reposts: 48,
    liked: false,
    music: "Sunrise - Sarah K.",
    isSaved: false,
  },
];

// ============== REEL COMMENTS ==============
export const REEL_COMMENTS = [
  {
    id: "rc1",
    reelId: "r1",
    userId: "2",
    user: "Kwame M.",
    handle: "@kwame",
    avatar: "https://picsum.photos/seed/kwame/120/120",
    verified: true,
    verifiedVariant: "blue",
    text: "This light is unreal 🔥",
    time: "12m",
    likes: 24,
  },
  {
    id: "rc2",
    reelId: "r1",
    userId: "9",
    user: "Foodie",
    handle: "@foodie",
    avatar: "https://picsum.photos/seed/foodie/120/120",
    verified: false,
    text: "Abuja sunsets hit different",
    time: "40m",
    likes: 8,
  },
  {
    id: "rc3",
    reelId: "r2",
    userId: "1",
    user: "Adaeze O.",
    handle: "@adaeze",
    avatar: "https://picsum.photos/seed/adaeze/120/120",
    verified: false,
    text: "Lagos never sleeps indeed 😅",
    time: "1h",
    likes: 15,
  },
  {
    id: "rc4",
    reelId: "r3",
    userId: "6",
    user: "Sarah K.",
    handle: "@sarahk",
    avatar: "https://picsum.photos/seed/sarah/120/120",
    verified: true,
    verifiedVariant: "white",
    text: "Adding this to my playlist right now",
    time: "2h",
    likes: 31,
  },
  {
    id: "rc5",
    reelId: "r4",
    userId: "10",
    user: "Travel Diaries",
    handle: "@traveldiaries",
    avatar: "https://picsum.photos/seed/travel/120/120",
    verified: true,
    verifiedVariant: "blue",
    text: "Need that studio tour 👀",
    time: "3h",
    likes: 12,
  },
  {
    id: "rc6",
    reelId: "r5",
    userId: "8",
    user: "Music Vibes",
    handle: "@musicvibes",
    avatar: "https://picsum.photos/seed/musicvibes/120/120",
    verified: false,
    verifiedVariant: "dark",
    text: "5am club represent ☀️",
    time: "4h",
    likes: 19,
  },
];

export function getReelComments(reelId) {
  return REEL_COMMENTS.filter((c) => c.reelId === reelId);
}

// ============== GROUPS ==============
export const GROUPS = [
  {
    id: "g1",
    name: "Design Crew",
    handle: "@designcrew",
    avatar: null,
    members: 5,
    isOnline: true,
    isGroup: true,
    isChannel: false,
    lastMessage: "Final mock is ready, review before standup",
    lastSender: "Adaeze",
    time: "2m",
    unreadCount: 3,
    isMuted: false,
    isPinned: true,
  },
  {
    id: "g2",
    name: "Family Gist",
    handle: "@family",
    avatar: null,
    members: 4,
    isOnline: false,
    isGroup: true,
    isChannel: false,
    lastMessage: "Call when you land",
    lastSender: "Mum",
    time: "3h",
    unreadCount: 1,
    isMuted: true,
    isPinned: false,
  },
  {
    id: "g3",
    name: "Dev Team",
    handle: "@devteam",
    avatar: null,
    members: 8,
    isOnline: true,
    isGroup: true,
    isChannel: false,
    lastMessage: "PR is merged 🚀",
    lastSender: "Sarah",
    time: "1h",
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
  },
];

// ============== CHANNELS ==============
export const CHANNELS = [
  {
    id: "c1",
    name: "Ping Updates",
    handle: "@ping",
    avatar: "https://picsum.photos/seed/pingteam/120/120",
    members: 50000,
    isOnline: false,
    isGroup: false,
    isChannel: true,
    lastMessage: "New reels feature is live",
    lastSender: "",
    time: "1d",
    unreadCount: 5,
    isMuted: false,
    isPinned: true,
  },
  {
    id: "c2",
    name: "Tech News",
    handle: "@technews",
    avatar: "https://picsum.photos/seed/technews/120/120",
    members: 12000,
    isOnline: false,
    isGroup: false,
    isChannel: true,
    lastMessage: "AI coding agents are changing everything",
    lastSender: "",
    time: "5h",
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
  },
  {
    id: "c3",
    name: "Music Vibes Daily",
    handle: "@musicvibes",
    avatar: "https://picsum.photos/seed/musicvibes/120/120",
    members: 8900,
    isOnline: false,
    isGroup: false,
    isChannel: false,
    lastMessage: "Today's top 10 Afrobeats tracks",
    lastSender: "",
    time: "4h",
    unreadCount: 2,
    isMuted: true,
    isPinned: false,
  },
];

// ============== LIVES ==============
export const LIVES = [
  {
    id: "l1",
    userId: "2",
    name: "Kwame M.",
    handle: "@kwame",
    avatar: "https://picsum.photos/seed/kwame/120/120",
    verified: true,
    verifiedVariant: "blue",
    cover: "https://picsum.photos/seed/live-1/400/700",
    title: "Behind the scenes Q&A",
    viewers: 1243,
    isLive: true,
  },
  {
    id: "l2",
    userId: "5",
    name: "Yemi A.",
    handle: "@yemi",
    avatar: "https://picsum.photos/seed/yemi/120/120",
    verified: false,
    cover: "https://picsum.photos/seed/live-2/400/700",
    title: "Photography workshop livestream",
    viewers: 567,
    isLive: true,
  },
  {
    id: "l3",
    userId: "7",
    name: "Dev Center",
    handle: "@devcenter",
    avatar: "https://picsum.photos/seed/devcenter/120/120",
    verified: true,
    verifiedVariant: "blue",
    cover: "https://picsum.photos/seed/live-3/400/700",
    title: "Building the next Ping features",
    viewers: 2341,
    isLive: true,
  },
];

// ============== COMMUNITIES ==============
export const COMMUNITIES = [
  {
    id: "comm1",
    name: "Ping Community",
    handle: "@pingcommunity",
    avatar: "https://picsum.photos/seed/pingcommunity/120/120",
    cover: "https://picsum.photos/seed/pingcomm-cover/600/300",
    verified: true,
    verifiedVariant: "gold",
    members: 50000,
    isAdmin: true,
    isJoined: true,
    description: "The official Ping community. Discuss features, share feedback, and stay updated.",
    tags: ["official", "feedback", "announcements"],
  },
  {
    id: "comm2",
    name: "Naija Creators",
    handle: "@najiacreators",
    avatar: "https://picsum.photos/seed/naijacreators/120/120",
    cover: "https://picsum.photos/seed/naijacreators-cover/600/300",
    verified: true,
    verifiedVariant: "blue",
    members: 12500,
    isAdmin: false,
    isJoined: true,
    description: "For Nigerian creators to connect and collaborate.",
    tags: ["creators", "nigeria", "community"],
  },
  {
    id: "comm3",
    name: "Tech Talk NG",
    handle: "@techtalktg",
    avatar: "https://picsum.photos/seed/techtalk/120/120",
    cover: "https://picsum.photos/seed/techtalk-cover/600/300",
    verified: false,
    members: 8900,
    isAdmin: false,
    isJoined: false,
    description: "Discussions about tech trends, tools, and opportunities in Nigeria.",
    tags: ["tech", "nigeria", "discussion"],
  },
  {
    id: "comm4",
    name: "Food Lovers NG",
    handle: "@foodloversng",
    avatar: "https://picsum.photos/seed/foodlovers/120/120",
    cover: "https://picsum.photos/seed/foodlovers-cover/600/300",
    verified: false,
    members: 5400,
    isAdmin: false,
    isJoined: false,
    description: "Recipes, restaurant reviews, and food discussions.",
    tags: ["food", "nigeria", "recipes"],
  },
];

// ============== COMMENTS ==============
export const COMMENTS = [
  {
    id: "cm1",
    postId: "1",
    userId: "5",
    user: "Yemi A.",
    handle: "@yemi",
    avatar: "https://picsum.photos/seed/yemi/120/120",
    text: "Count me in! I'll bring my favorite board game.",
    time: "1h ago",
    likes: 12,
    liked: false,
    replies: 2,
  },
  {
    id: "cm2",
    postId: "1",
    userId: "6",
    user: "Sarah K.",
    handle: "@sarahk",
    avatar: "https://picsum.photos/seed/sarah/120/120",
    verified: true,
    verifiedVariant: "white",
    text: "I'm in! Can I bring my ukulele? 🎸",
    time: "45m ago",
    likes: 8,
    liked: true,
    replies: 0,
  },
  {
    id: "cm3",
    postId: "2",
    userId: "4",
    user: "Ping Team",
    handle: "@ping",
    avatar: "https://picsum.photos/seed/pingteam/120/120",
    verified: true,
    verifiedVariant: "gold",
    text: "🔥 This reel is fire!",
    time: "12m ago",
    likes: 42,
    liked: false,
    replies: 3,
  },
  {
    id: "cm4",
    postId: "2",
    userId: "8",
    user: "Music Vibes",
    handle: "@musicvibes",
    avatar: "https://picsum.photos/seed/musicvibes/120/120",
    verified: false,
    verifiedVariant: "dark",
    text: "Loved the transition at 0:15!",
    time: "5m ago",
    likes: 17,
    liked: false,
    replies: 1,
  },
];

// ============== COMMENT REPLIES ==============
export const COMMENT_REPLIES = [
  {
    id: "cr1",
    commentId: "cm1",
    userId: "2",
    user: "Kwame M.",
    handle: "@kwame",
    avatar: "https://picsum.photos/seed/kwame/120/120",
    verified: true,
    verifiedVariant: "blue",
    text: "Same here! Love board games.",
    time: "50m ago",
    likes: 5,
  },
  {
    id: "cr2",
    commentId: "cm1",
    userId: "4",
    user: "Ping Team",
    handle: "@ping",
    avatar: "https://picsum.photos/seed/pingteam/120/120",
    verified: true,
    verifiedVariant: "gold",
    text: "We should add a games night mode.",
    time: "30m ago",
    likes: 3,
  },
  {
    id: "cr3",
    commentId: "cm3",
    userId: "1",
    user: "Adaeze O.",
    handle: "@adaeze",
    avatar: "https://picsum.photos/seed/adaeze/120/120",
    text: "The whole team worked hard on it!",
    time: "10m ago",
    likes: 7,
  },
];

// ============== LIKES ==============
export const LIKES = [
  { id: "lk1", userId: "5", user: "Yemi A.", handle: "@yemi", avatar: "https://picsum.photos/seed/yemi/120/120", time: "2h ago", reaction: "❤️" },
  { id: "lk2", userId: "6", user: "Sarah K.", handle: "@sarahk", avatar: "https://picsum.photos/seed/sarah/120/120", verified: true, verifiedVariant: "white", time: "1h ago", reaction: "🔥" },
  { id: "lk3", userId: "4", user: "Ping Team", handle: "@ping", avatar: "https://picsum.photos/seed/pingteam/120/120", verified: true, verifiedVariant: "gold", time: "30m ago", reaction: "👏" },
  { id: "lk4", userId: "8", user: "Music Vibes", handle: "@musicvibes", avatar: "https://picsum.photos/seed/musicvibes/120/120", verified: false, verifiedVariant: "dark", time: "15m ago", reaction: "❤️" },
  { id: "lk5", userId: "7", user: "Dev Center", handle: "@devcenter", avatar: "https://picsum.photos/seed/devcenter/120/120", verified: true, verifiedVariant: "blue", time: "5m ago", reaction: "🎉" },
  { id: "lk6", userId: "9", user: "Foodie", handle: "@foodie", avatar: "https://picsum.photos/seed/foodie/120/120", verified: false, time: "3m ago", reaction: "❤️" },
  { id: "lk7", userId: "10", user: "Travel Diaries", handle: "@traveldiaries", avatar: "https://picsum.photos/seed/travel/120/120", verified: true, verifiedVariant: "blue", time: "1m ago", reaction: "🔥" },
];

// ============== NOTIFICATIONS ==============
export const NOTIFICATIONS = [
  { id: "n1", type: "like", userId: "5", user: "Yemi A.", avatar: "https://picsum.photos/seed/yemi/120/120", text: "liked your ping", time: "2m ago", postId: "1", read: false },
  { id: "n2", type: "comment", userId: "6", user: "Sarah K.", avatar: "https://picsum.photos/seed/sarah/120/120", verified: true, verifiedVariant: "white", text: "commented on your ping", time: "18m ago", postId: "2", commentId: "cm3", read: false },
  { id: "n3", type: "follow", userId: "8", user: "Music Vibes", avatar: "https://picsum.photos/seed/musicvibes/120/120", verified: false, verifiedVariant: "dark", text: "started following you", time: "1h ago", read: true },
  { id: "n4", type: "reply", userId: "7", user: "Dev Center", avatar: "https://picsum.photos/seed/devcenter/120/120", verified: true, verifiedVariant: "blue", text: "replied to your comment", time: "2h ago", postId: "1", commentId: "cm1", read: true },
  { id: "n5", type: "mention", userId: "4", user: "Ping Team", avatar: "https://picsum.photos/seed/pingteam/120/120", verified: true, verifiedVariant: "gold", text: "mentioned you in a ping", time: "3h ago", postId: "2", read: true },
  { id: "n6", type: "story", userId: "2", user: "Kwame M.", avatar: "https://picsum.photos/seed/kwame/120/120", verified: true, verifiedVariant: "blue", text: "posted a new story", time: "4h ago", storyId: "s2", read: true },
  { id: "n7", type: "reel", userId: "10", user: "Travel Diaries", avatar: "https://picsum.photos/seed/travel/120/120", verified: true, verifiedVariant: "blue", text: "mentioned you in a reel", time: "5h ago", reelId: "r1", read: false },
  { id: "n8", type: "group_invite", userId: "2", user: "Kwame M.", avatar: "https://picsum.photos/seed/kwame/120/120", verified: true, verifiedVariant: "blue", text: "invited you to join Design Crew", time: "1d ago", groupId: "g1", groupName: "Design Crew", groupAvatar: null, groupMembers: 5, read: false },
  { id: "n9", type: "community_invite", userId: "4", user: "Ping Team", avatar: "https://picsum.photos/seed/pingteam/120/120", verified: true, verifiedVariant: "gold", text: "invited you to join Ping Community", time: "2d ago", communityId: "comm1", communityName: "Ping Community", read: true },
];

// ============== HELPERS ==============
export function getProfileById(id) {
  return USER_PROFILES[String(id)] ?? null;
}

export function getStories() {
  return STORIES;
}

export function getBasePings() {
  return BASE_PINGS;
}

export function getReels() {
  return REELS;
}

export function getGroups() {
  return GROUPS;
}

export function getChannels() {
  return CHANNELS;
}

export function getLives() {
  return LIVES;
}

export function getFriends() {
  return FRIENDS;
}

export function getFollowings() {
  return FOLLOWINGS;
}

export function getFollowers() {
  return FOLLOWERS;
}

export function getComments(postId) {
  return COMMENTS.filter((c) => c.postId === postId);
}

export function getCommentReplies(commentId) {
  return COMMENT_REPLIES.filter((r) => r.commentId === commentId);
}

export function getLikes(postId) {
  return LIKES.filter((l) => l.postId === postId);
}

export function getNotifications() {
  return NOTIFICATIONS;
}

export function getPostById(id) {
  const all = [...BASE_PINGS, ...generatePings(BASE_PINGS.length, 100)];
  return all.find((p) => p.id === id) ?? null;
}

export function getReelById(id) {
  return REELS.find((r) => r.id === id) ?? null;
}


export function generatePings(offset, count = 5) {
  return Array.from({ length: count }, (_, i) => {
    const idx = offset + i + 1;
    const profileIds = Object.keys(USER_PROFILES);
    const profileId = profileIds[idx % profileIds.length];
    const profile = USER_PROFILES[profileId];
    const isVideo = idx % 3 === 0;
    const hasMedia = idx % 4 !== 0;

    return {
      id: `gen-${idx}`,
      userId: profileId,
      user: profile.name,
      handle: profile.handle,
      avatar: profile.avatar,
      time: `${idx}m ago`,
      text: `This is generated post #${idx}. The quick brown fox jumps over the lazy dog.`,
      tags: ["generated", "feed"],
      likes: Math.floor(Math.random() * 200) + 10,
      replies: Math.floor(Math.random() * 50) + 1,
      liked: Math.random() > 0.7,
      verified: profile.verified,
      verifiedVariant: profile.verifiedVariant,
      showFollow: Math.random() > 0.3,
      tagged: idx % 5 < 2 ? ["https://picsum.photos/seed/gen-tag/80/80"] : [],
      media: hasMedia
        ? {
            type: isVideo ? "video" : "image",
            uri: `https://picsum.photos/seed/gen-media-${idx}/600/600`,
            ...(isVideo && { duration: `0:${(idx % 60).toString().padStart(2, "0")}` }),
          }
        : null,
    };
  });
}

export function formatLikes(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (n >= 100) return `${Math.floor(n / 10) * 10}`;
  return `${n}`;
}

export const MY_PROFILE = Object.freeze({
  id: MY_USER_ID,
  name: MY_NAME,
  handle: MY_HANDLE,
  avatar: MY_AVATAR,
  bio: MY_BIO,
  location: MY_LOCATION,
  verified: false,
  verifiedVariant: "blue",
});

// ============== SONGS ==============
export const SONGS = [
  { id: "so1", title: "Golden Hour", artist: "Jourde", album: "Coast & Fire", duration: "3:24", uri: "https://example.com/song1.mp3" },
  { id: "so2", title: "Essence (Remix)", artist: "Wizkid ft. Tems", album: "Essence (Remix)", duration: "4:15", uri: "https://example.com/song2.mp3" },
  { id: "so3", title: "Calm Down", artist: "Rema", album: "Rapture", duration: "3:48", uri: "https://example.com/song3.mp3" },
  { id: "so4", title: "Flowers", artist: "Miley Cyrus", album: "Endless Summer Vacation", duration: "3:22", uri: "https://example.com/song4.mp3" },
  { id: "so5", title: "Asake", artist: "PBUY", album: "PBUY", duration: "4:05", uri: "https://example.com/song5.mp3" },
  { id: "so6", title: "Last Roll Call", artist: "Burna Boy", album: "Love, Damini", duration: "3:35", uri: "https://example.com/song6.mp3" },
  { id: "so7", title: "Circles", artist: "The Weeknd", album: "Dawn FM", duration: "3:45", uri: "https://example.com/song7.mp3" },
];

// ============== PLACES ==============
export const PLACES = [
  { id: "pl1", name: "Elegushi Beach", address: "Elegushi, Lagos", latitude: 6.4541, longitude: 3.4265, category: "Beach" },
  { id: "pl2", name: "Lekki Conservation Centre", address: "Lekki, Lagos", latitude: 6.4580, longitude: 3.5300, category: "Park" },
  { id: "pl3", name: "Ikeja City Mall", address: "Ikeja, Lagos", latitude: 6.6325, longitude: 3.3900, category: "Shopping" },
  { id: "pl4", name: "National Theatre", address: "Iganmu, Lagos", latitude: 6.4751, longitude: 3.3579, category: "Landmark" },
  { id: "pl5", name: "Olumo Rock", address: "Abuja, Nigeria", latitude: 9.0487, longitude: 7.4031, category: "Rock Formation" },
  { id: "pl6", name: "Victoria Island", address: "Lagos, Nigeria", latitude: 6.4541, longitude: 3.4265, category: "District" },
];

// ============== HASHTAGS ==============
export const HASHTAGS = [
  { id: "h1", tag: "weekend", posts: 2340, trending: true },
  { id: "h2", tag: "lagos", posts: 5670, trending: true },
  { id: "h3", tag: "travel", posts: 12400, trending: true },
  { id: "h4", tag: "food", posts: 8900, trending: false },
  { id: "h5", tag: "reel", posts: 3450, trending: false },
  { id: "h6", tag: "music", posts: 6700, trending: true },
  { id: "h7", tag: "afrobeats", posts: 4300, trending: false },
  { id: "h8", tag: "nigeria", posts: 9800, trending: true },
  { id: "h9", tag: "beachhouse", posts: 1200, trending: false },
  { id: "h10", tag: "boardgames", posts: 890, trending: false },
];

// ============== CHAT LIST MESSAGES ==============
export const MESSAGES = [
  { id: "msg1", conversationId: "1", senderId: "adaeze", isMine: false, kind: "text", text: "Morning team, designs are in", time: "09:12", date: "Today", status: null },
  { id: "msg2", conversationId: "1", senderId: "kwame", isMine: false, kind: "image", uri: "https://picsum.photos/seed/ping-design/600/400", text: "Final mock is ready", time: "09:14", date: "Today", status: null },
  { id: "msg3", conversationId: "1", senderId: "yemi", isMine: false, kind: "voice", uri: null, duration: 12, time: "09:14", date: "Today", status: null },
  { id: "msg4", conversationId: "1", senderId: "you", isMine: true, kind: "text", text: "On it, checking now", time: "09:15", date: "Today", status: "read" },
  { id: "msg5", conversationId: "1", senderId: "you", isMine: true, kind: "image", uri: "https://picsum.photos/seed/ping-snack/600/800", time: "09:16", date: "Today", status: "read" },
  { id: "msg6", conversationId: "1", senderId: "adaeze", isMine: false, kind: "text", text: "Thanks for the review!", time: "09:45", date: "Today", status: null },
  { id: "msg7", conversationId: "1", senderId: "kwame", isMine: false, kind: "video", uri: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4", text: "Behind the scenes", duration: 10, time: "10:30", date: "Today", status: null },
  { id: "msg8", conversationId: "1", senderId: "you", isMine: true, kind: "text", text: "Clean edit, that transition is smooth", time: "08:52", date: "Today", status: "read" },
  { id: "msg9", conversationId: "2", senderId: "you", isMine: true, kind: "text", text: "Yo, check this reel", time: "08:40", date: "Today", status: "sent" },
  { id: "msg10", conversationId: "2", senderId: null, isMine: false, kind: "text", text: "Sent a reel", time: "08:41", date: "Today", status: null },
  { id: "msg11", conversationId: "3", senderId: "mum", isMine: false, kind: "text", text: "Call when you land", time: "06:30", date: "Yesterday", status: null },
  { id: "msg12", conversationId: "3", senderId: "mum", isMine: false, kind: "file", fileName: "boarding-pass.pdf", fileSize: 184320, mimeType: "application/pdf", time: "06:31", date: "Yesterday", status: null },
];

// ============== CHAT LIST ==============
export const CHAT_LIST = [
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
    lastSender: "Adaeze",
    lastCallType: "voice",
    lastCallCategory: "missed",
    callFrom: "Adaeze",
    callTime: "2m",
    isConference: true,
    missedCalls: 1,
  },
  {
    id: "2",
    name: "Kwame M.",
    avatar: "https://picsum.photos/seed/kwame/120/120",
    lastMessage: "Sent a reel",
    time: "1h",
    unreadCount: 0,
    isOnline: true,
    isMuted: false,
    isGroup: false,
    isChannel: false,
    lastSender: "You",
    lastCallType: "video",
    lastCallCategory: "outgoing",
    callTime: "1h",
    isConference: false,
    missedCalls: 0,
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
    lastSender: "Mum",
    lastCallType: "voice",
    lastCallCategory: "received",
    callFrom: "Mum",
    callTime: "3h",
    isConference: false,
    missedCalls: 0,
  },
  {
    id: "4",
    name: "Ping Updates",
    avatar: "https://picsum.photos/seed/pingteam/120/120",
    lastMessage: "New reels feature is live",
    time: "1d",
    unreadCount: 5,
    isOnline: false,
    isMuted: false,
    isGroup: false,
    isChannel: true,
    lastSender: "",
    lastCallType: null,
    lastCallCategory: null,
    isConference: false,
    missedCalls: 0,
  },
  {
    id: "5",
    name: "Yemi A.",
    avatar: "https://picsum.photos/seed/yemi/120/120",
    lastMessage: "Let's catch up soon!",
    time: "45m",
    unreadCount: 0,
    isOnline: true,
    isMuted: false,
    isGroup: false,
    isChannel: false,
    lastSender: "Yemi",
    lastCallType: null,
    lastCallCategory: null,
    isConference: false,
    missedCalls: 0,
  },
  {
    id: "6",
    name: "Music Vibes",
    avatar: "https://picsum.photos/seed/musicvibes/120/120",
    lastMessage: "New track dropping Friday 🎶",
    time: "2h",
    unreadCount: 2,
    isOnline: true,
    isMuted: false,
    isGroup: false,
    isChannel: false,
    verified: false,
    verifiedVariant: "dark",
    lastSender: "Music Vibes",
    lastCallType: null,
    lastCallCategory: null,
    isConference: false,
    missedCalls: 0,
  },
];

// ============== HELPERS FOR NEW DATA ==============
export function getSongs() {
  return SONGS;
}

export function getPlaces() {
  return PLACES;
}

export function getHashtags() {
  return HASHTAGS;
}

export function getMessages(conversationId) {
  return MESSAGES.filter((m) => m.conversationId === conversationId);
}

export function getChatList() {
  return CHAT_LIST;
}

export function getTrendingHashtags(limit = 5) {
  return HASHTAGS.filter((h) => h.trending).slice(0, limit);
}

export function getSongById(id) {
  return SONGS.find((s) => s.id === id) ?? null;
}

export function getPlaceById(id) {
  return PLACES.find((p) => p.id === id) ?? null;
}

export function getHashtagById(id) {
  return HASHTAGS.find((h) => h.id === id) ?? null;
}

export function getCommunities() {
  return COMMUNITIES;
}

export function getCommunityById(id) {
  return COMMUNITIES.find((c) => c.id === String(id)) ?? null;
}
