import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import PhoneScreen from "../../components/navigation/PhoneScreen";
import Avatar from "../../components/ui/Avatar";
import Icon from "../../components/ui/Icon";
import { palette } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { shadows } from "../../constants/shadows";
import { useFeed, useReelsData, useStoriesData } from "../../hooks";
import { getPlaces, getSongs, getTrendingHashtags } from "../../lib/mockData";

const MAX_PING_LENGTH = 280;
const MAX_CAPTION_LENGTH = 120;

const MODES = [
  { key: "ping", label: "Ping", icon: "edit" },
  { key: "story", label: "Story", icon: "image" },
  { key: "reel", label: "Reel", icon: "reels" },
];

const AUDIENCES = [
  { key: "public", label: "Everyone", icon: "globe" },
  { key: "friends", label: "Friends", icon: "users" },
  { key: "private", label: "Only me", icon: "lock" },
];

const SONGS = getSongs();
const PLACES = getPlaces();
const TRENDING_TAGS = getTrendingHashtags(4).map((hashtag) => hashtag.tag);

// The app has no camera roll wired up yet, so every "capture" below picks a
// deterministic placeholder — the same mock media the rest of the app uses.
const photo = (seed, width = 600, height = 600) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

const PHOTO_URI = photo("create-photo");
const VIDEO_POSTER = photo("create-video");
const VIDEO_URI =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const VIDEO_DURATION = "0:15";
const STORY_COVERS = [1, 2, 3, 4, 5, 6].map((n) =>
  photo(`create-story-${n}`, 240, 320)
);
const REEL_COVERS = [1, 2, 3, 4, 5, 6].map((n) =>
  photo(`create-reel-${n}`, 400, 700)
);

const slug = (value) => value.replace(/[^A-Za-z0-9]/g, "");
const extractTags = (value) =>
  (value.match(/#[A-Za-z0-9_]+/g) ?? []).map((tag) => tag.slice(1));

function ModeSwitch({ mode, onChange }) {
  return (
    <View style={styles.segments}>
      {MODES.map((item) => {
        const active = item.key === mode;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && styles.segmentPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
          >
            <Icon
              name={item.icon}
              size={16}
              color={active ? palette.ink : palette.muted}
              strokeWidth={active ? 2 : 1.5}
            />
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SectionLabel({ children, hint }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {!!hint && <Text style={styles.sectionHint}>{hint}</Text>}
    </View>
  );
}

function PublishedBanner({ title, actionLabel, onAction }) {
  return (
    <View style={styles.banner}>
      <View style={styles.bannerIcon}>
        <Icon name="check" size={14} color="#FFFFFF" strokeWidth={2.5} />
      </View>
      <Text style={styles.bannerText}>{title}</Text>
      <Pressable
        onPress={onAction}
        style={styles.bannerAction}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        <Text style={styles.bannerActionText}>{actionLabel}</Text>
        <Icon name="forward" size={14} color={palette.primary} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

function AttachChip({ icon, label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Icon
        name={icon}
        size={18}
        color={active ? palette.primary : palette.ink}
        strokeWidth={active ? 2 : 1.5}
      />
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
      {active && <Icon name="close" size={14} color={palette.primary} strokeWidth={2} />}
    </Pressable>
  );
}

function OptionPill({ label, meta, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionPill,
        active && styles.optionPillActive,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text
        style={[styles.optionPillText, active && styles.optionPillTextActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {!!meta && (
        <Text style={styles.optionPillMeta} numberOfLines={1}>
          {meta}
        </Text>
      )}
    </Pressable>
  );
}

function CoverTile({ uri, width, height, selected, onPress, label }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.coverTile, { width, height }, selected && styles.coverTileActive]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Image source={{ uri }} style={styles.coverImage} resizeMode="cover" />
      {selected && (
        <View style={styles.coverCheck}>
          <Icon name="check" size={14} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      )}
    </Pressable>
  );
}

function CreateHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Create</Text>
      <Text style={styles.subtitle}>Share something with your people.</Text>
    </View>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams();
  const { onCreatePing } = useFeed();
  const { myProfile, onCreateStory } = useStoriesData();
  const { onCreateReel } = useReelsData();

  const [mode, setMode] = useState("ping");

  const goHome = useCallback(() => router.navigate("/"), [router]);
  const goReels = useCallback(() => router.navigate("/reels"), [router]);

  // Home's "Start a story" card links here as ?mode=story: apply the request
  // once, then clear the param so the tab reopens on the ping composer.
  useEffect(() => {
    const requested = MODES.find((item) => item.key === modeParam);
    if (!requested) return;
    setMode(requested.key);
    router.setParams({ mode: "" });
  }, [modeParam, router]);

  const handleModeChange = useCallback((key) => {
    Haptics.selectionAsync().catch(() => {});
    setMode(key);
  }, []);

  return (
    <PhoneScreen padded={false}>
      <CreateHeader />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ModeSwitch mode={mode} onChange={handleModeChange} />

          {mode === "ping" && (
            <PingComposer
              myProfile={myProfile}
              onCreatePing={onCreatePing}
              onView={goHome}
            />
          )}
          {mode === "story" && (
            <StoryComposer
              myProfile={myProfile}
              onCreateStory={onCreateStory}
              onView={goHome}
            />
          )}
          {mode === "reel" && (
            <ReelComposer
              myProfile={myProfile}
              onCreateReel={onCreateReel}
              onView={goReels}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </PhoneScreen>
  );
}
function PingComposer({ myProfile, onCreatePing, onView }) {
  const [text, setText] = useState("");
  const [audience, setAudience] = useState("public");
  const [media, setMedia] = useState(null);
  const [song, setSong] = useState(null);
  const [place, setPlace] = useState(null);
  const [picker, setPicker] = useState(null);
  const [published, setPublished] = useState(false);

  const canPost = text.trim().length > 0 || !!media;

  const toggleMedia = (type) => {
    Haptics.selectionAsync().catch(() => {});
    setPicker(null);
    setMedia((current) => {
      if (current && current.type === type) return null;
      return type === "video"
        ? { type: "video", uri: VIDEO_POSTER, duration: VIDEO_DURATION }
        : { type: "image", uri: PHOTO_URI };
    });
  };

  const togglePicker = (key) => {
    Haptics.selectionAsync().catch(() => {});
    setPicker((current) => (current === key ? null : key));
  };

  const addTag = (tag) => {
    Haptics.selectionAsync().catch(() => {});
    setText((value) => {
      if (value.includes(`#${tag}`)) return value;
      const prefix = value.trim().length > 0 ? `${value.trimEnd()} ` : "";
      return `${prefix}#${tag} `;
    });
  };

  const discard = () => {
    setText("");
    setMedia(null);
    setSong(null);
    setPlace(null);
    setPicker(null);
  };

  const submit = () => {
    if (!canPost) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const tags = [
      ...new Set([
        ...extractTags(text),
        ...(place ? [slug(place.name)] : []),
        ...(song ? [slug(song.title)] : []),
      ]),
    ].filter(Boolean);

    onCreatePing({
      id: `ping-me-${Date.now()}`,
      userId: myProfile.id,
      user: myProfile.name,
      handle: myProfile.handle,
      avatar: myProfile.avatar,
      verified: false,
      verifiedVariant: "blue",
      time: "Just now",
      audience,
      text: text.trim(),
      tags,
      likes: 0,
      replies: 0,
      liked: false,
      showFollow: false,
      tagged: [],
      media,
      song: song ? `${song.title} · ${song.artist}` : null,
      place: place ? place.name : null,
    });

    discard();
    setPublished(true);
  };

  return (
    <>
      {published && (
        <PublishedBanner
          title="Your ping is at the top of the feed"
          actionLabel="View"
          onAction={onView}
        />
      )}

      <View style={[styles.card, shadows.card]}>
        <View style={styles.cardTop}>
          <Avatar uri={myProfile.avatar} name={myProfile.name} size={44} />
          <View style={styles.who}>
            <Text style={styles.whoName}>{myProfile.name}</Text>
            <Text style={styles.whoHandle}>{myProfile.handle}</Text>
          </View>
          <Text
            style={[
              styles.counter,
              text.length > MAX_PING_LENGTH - 20 && styles.counterWarn,
            ]}
          >
            {text.length}/{MAX_PING_LENGTH}
          </Text>
        </View>

        <TextInput
          style={styles.composerInput}
          placeholder="What's on your mind?"
          placeholderTextColor={palette.muted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={MAX_PING_LENGTH}
          accessibilityLabel="Ping text"
        />

        <View style={styles.audienceRow}>
          {AUDIENCES.map((option) => {
            const active = option.key === audience;
            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setAudience(option.key);
                }}
                style={[styles.audiencePill, active && styles.audiencePillActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option.label}
              >
                <Icon
                  name={option.icon}
                  size={14}
                  color={active ? "#FFFFFF" : palette.muted}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.audiencePillText,
                    active && styles.audiencePillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!!media && (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: media.uri }} style={styles.mediaImage} resizeMode="cover" />
            {media.type === "video" && (
              <View style={styles.mediaPill}>
                <Icon name="video" size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.mediaPillText}>{media.duration}</Text>
              </View>
            )}
            <Pressable
              onPress={() => setMedia(null)}
              style={styles.mediaRemove}
              accessibilityRole="button"
              accessibilityLabel="Remove attachment"
            >
              <Icon name="close" size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          <AttachChip
            icon="image"
            label="Photo"
            active={!!media && media.type === "image"}
            onPress={() => toggleMedia("image")}
          />
          <AttachChip
            icon="video"
            label="Video"
            active={!!media && media.type === "video"}
            onPress={() => toggleMedia("video")}
          />
          <AttachChip
            icon="music"
            label="Music"
            active={!!song}
            onPress={() => togglePicker("music")}
          />
          <AttachChip
            icon="location"
            label={place ? place.name : "Location"}
            active={!!place}
            onPress={() => togglePicker("place")}
          />
        </ScrollView>

        {picker === "music" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pickerScroll}
            contentContainerStyle={styles.chipRow}
            keyboardShouldPersistTaps="handled"
          >
            {SONGS.map((item) => (
              <OptionPill
                key={item.id}
                label={item.title}
                meta={item.artist}
                active={!!song && song.id === item.id}
                onPress={() => {
                  setSong(item);
                  setPicker(null);
                }}
              />
            ))}
          </ScrollView>
        )}

        {picker === "place" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pickerScroll}
            contentContainerStyle={styles.chipRow}
            keyboardShouldPersistTaps="handled"
          >
            {PLACES.map((item) => (
              <OptionPill
                key={item.id}
                label={item.name}
                meta={item.address}
                active={!!place && place.id === item.id}
                onPress={() => {
                  setPlace(item);
                  setPicker(null);
                }}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.tagRow}>
          {TRENDING_TAGS.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => addTag(tag)}
              style={styles.tagChip}
              accessibilityRole="button"
              accessibilityLabel={`Add hashtag ${tag}`}
            >
              <Text style={styles.tagChipText}>#{tag}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.btnRow}>
          <Pressable
            onPress={submit}
            disabled={!canPost}
            style={[styles.primaryBtn, !canPost && styles.primaryBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Post ping"
          >
            <Icon name="send" size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryBtnText}>Post ping</Text>
          </Pressable>
          <Pressable
            onPress={discard}
            style={styles.secondaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Clear draft"
          >
            <Text style={styles.secondaryBtnText}>Clear</Text>
          </Pressable>
        </View>

        {!canPost && (
          <Text style={styles.footerNote}>
            Add text or a photo - your ping appears at the top of the Home feed.
          </Text>
        )}
      </View>
    </>
  );
}
function StoryComposer({ myProfile, onCreateStory, onView }) {
  const [cover, setCover] = useState(null);
  const [published, setPublished] = useState(false);

  const submit = () => {
    if (!cover) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onCreateStory({ cover });
    setCover(null);
    setPublished(true);
  };

  return (
    <>
      {published && (
        <PublishedBanner
          title="Story shared - live for 24 hours"
          actionLabel="View in stories"
          onAction={onView}
        />
      )}

      <View style={[styles.card, shadows.card]}>
        <View style={styles.cardTop}>
          <Avatar uri={myProfile.avatar} name={myProfile.name} size={44} />
          <View style={styles.who}>
            <Text style={styles.whoName}>Your story</Text>
            <Text style={styles.whoHandle}>Followers can watch it for 24 hours</Text>
          </View>
        </View>

        <SectionLabel hint={`${STORY_COVERS.length} covers`}>Pick a cover</SectionLabel>

        <View style={styles.coverGrid}>
          {STORY_COVERS.map((uri, index) => (
            <CoverTile
              key={uri}
              uri={uri}
              width={96}
              height={128}
              selected={cover === uri}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setCover(uri);
              }}
              label={`Story cover ${index + 1}`}
            />
          ))}
        </View>

        <View style={styles.btnRow}>
          <Pressable
            onPress={submit}
            disabled={!cover}
            style={[styles.primaryBtn, !cover && styles.primaryBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Share story"
          >
            <Icon name="image" size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryBtnText}>Share story</Text>
          </Pressable>
        </View>

        <Text style={styles.footerNote}>
          {cover
            ? "Ready - new stories appear first in the story row on Home."
            : "Pick a cover to enable sharing."}
        </Text>
      </View>
    </>
  );
}

function ReelComposer({ myProfile, onCreateReel, onView }) {
  const [cover, setCover] = useState(null);
  const [caption, setCaption] = useState("");
  const [song, setSong] = useState(SONGS[0]);
  const [published, setPublished] = useState(false);

  const submit = () => {
    if (!cover) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    onCreateReel({
      id: `reel-me-${Date.now()}`,
      userId: myProfile.id,
      user: myProfile.name,
      handle: myProfile.handle,
      avatar: myProfile.avatar,
      verified: false,
      videoUri: VIDEO_URI,
      cover,
      duration: VIDEO_DURATION,
      description: caption.trim() || "Just posted from the Create tab",
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      reposts: 0,
      liked: false,
      music: song ? `${song.title} · ${song.artist}` : "Original audio",
      isSaved: false,
    });

    setCover(null);
    setCaption("");
    setPublished(true);
  };

  return (
    <>
      {published && (
        <PublishedBanner
          title="Reel published - it leads your Reels tab"
          actionLabel="View in reels"
          onAction={onView}
        />
      )}

      <View style={[styles.card, shadows.card]}>
        <View style={styles.cardTop}>
          <Avatar uri={myProfile.avatar} name={myProfile.name} size={44} />
          <View style={styles.who}>
            <Text style={styles.whoName}>New reel</Text>
            <Text style={styles.whoHandle}>{VIDEO_DURATION} clip</Text>
          </View>
        </View>

        <SectionLabel hint="Scroll to pick">Cover frame</SectionLabel>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pickerScroll}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          {REEL_COVERS.map((uri, index) => (
            <CoverTile
              key={uri}
              uri={uri}
              width={84}
              height={120}
              selected={cover === uri}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setCover(uri);
              }}
              label={`Reel cover ${index + 1}`}
            />
          ))}
        </ScrollView>

        <SectionLabel hint={`${caption.length}/${MAX_CAPTION_LENGTH}`}>
          Caption
        </SectionLabel>
        <TextInput
          style={styles.captionInput}
          placeholder="Say something about this reel..."
          placeholderTextColor={palette.muted}
          value={caption}
          onChangeText={setCaption}
          maxLength={MAX_CAPTION_LENGTH}
          returnKeyType="done"
          accessibilityLabel="Reel caption"
        />

        <SectionLabel hint={song ? "Attached" : "None"}>Sound</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pickerScroll}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          {SONGS.map((item) => (
            <OptionPill
              key={item.id}
              label={item.title}
              meta={item.artist}
              active={!!song && song.id === item.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSong(!!song && song.id === item.id ? null : item);
              }}
            />
          ))}
        </ScrollView>

        <View style={styles.btnRow}>
          <Pressable
            onPress={submit}
            disabled={!cover}
            style={[styles.primaryBtn, !cover && styles.primaryBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Post reel"
          >
            <Icon name="reels" size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryBtnText}>Post reel</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setCover(null);
              setCaption("");
            }}
            style={styles.secondaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Reset reel"
          >
            <Text style={styles.secondaryBtnText}>Reset</Text>
          </Pressable>
        </View>

        <Text style={styles.footerNote}>
          {cover
            ? "Ready - your reel lands at the top of the Reels tab."
            : "Pick a cover frame to enable posting."}
        </Text>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    backgroundColor: palette.card,
  },
  title: { fontSize: 24, fontWeight: "800", color: palette.ink },
  subtitle: { fontSize: 13, color: palette.muted, marginTop: 2 },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 14,
  },

  // Pill switch: one rounded container, the active side becomes a white thumb.
  segments: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 2,
    padding: 4,
    borderRadius: 999,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  segmentActive: { backgroundColor: "#FFFFFF", ...shadows.card },
  segmentPressed: { opacity: 0.85 },
  segmentText: { fontSize: 13, fontWeight: "600", color: palette.muted },
  segmentTextActive: { color: palette.ink, fontWeight: "700" },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: palette.primarySoft,
  },
  bannerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.success,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: "600",
    color: palette.ink,
  },
  bannerAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  bannerActionText: { fontSize: 13, fontWeight: "700", color: palette.primary },

  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: 14,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  who: { flex: 1, minWidth: 0 },
  whoName: { fontSize: 15, fontWeight: "700", color: palette.ink },
  whoHandle: { fontSize: 12, color: palette.muted, marginTop: 2 },
  counter: { fontSize: 12, fontWeight: "600", color: palette.muted },
  counterWarn: { color: palette.warning },

  composerInput: {
    minHeight: 96,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    color: palette.ink,
    fontSize: 15,
    lineHeight: 21,
  },

  audienceRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  audiencePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
  },
  audiencePillActive: { backgroundColor: palette.dark, borderColor: palette.dark },
  audiencePillText: { fontSize: 12, fontWeight: "600", color: palette.muted },
  audiencePillTextActive: { color: "#FFFFFF" },

  mediaPreview: {
    marginTop: 12,
    height: 180,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: palette.surface,
  },
  mediaImage: { width: "100%", height: "100%" },
  mediaPill: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  mediaPillText: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
  mediaRemove: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  chipScroll: { marginTop: 12, flexGrow: 0 },
  chipRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
  },
  chipActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  chipPressed: { opacity: 0.7 },
  chipText: { fontSize: 13, fontWeight: "600", color: palette.ink, maxWidth: 140 },
  chipTextActive: { color: palette.primary },

  pickerScroll: { marginTop: 10, flexGrow: 0 },
  optionPill: {
    minWidth: 132,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
  },
  optionPillActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  optionPillText: { fontSize: 13, fontWeight: "700", color: palette.ink },
  optionPillTextActive: { color: palette.primary },
  optionPillMeta: { fontSize: 11, color: palette.muted, marginTop: 2 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: palette.surface,
  },
  tagChipText: { fontSize: 12, fontWeight: "600", color: "#2F80ED" },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: palette.dark,
  },
  primaryBtnDisabled: { backgroundColor: palette.line },
  primaryBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  secondaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "600", color: palette.ink },

  footerNote: { fontSize: 12, color: palette.muted, marginTop: 10, lineHeight: 17 },

  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: palette.ink },
  sectionHint: { fontSize: 12, color: palette.muted },

  coverGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  coverTile: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: palette.surface,
  },
  coverTileActive: { borderColor: palette.primary },
  coverImage: { width: "100%", height: "100%" },
  coverCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  captionInput: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    color: palette.ink,
    fontSize: 14,
  },
});
