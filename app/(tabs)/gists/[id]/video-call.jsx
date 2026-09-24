import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Pressable,
  Dimensions,
  Image
} from "react-native";
// import { Image } from "react-native"; // needed when you turn the thumbnails back on
import { CameraView } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "../../../../components/ui/Icon";
import { getConversation } from "../../../../lib/gists";

// NOTE: verify this icon name exists in ../../../../components/ui/Icon —
// "sparkle" (the little stars next to the filter name in the pill below).

// Filter circles are plain colors for now. The photo thumbnails are commented
// out: drop your images in assets/filters/, uncomment the lines here, then
// uncomment the <Image> block inside FilterItem (and the Image import above).
const THUMBS = {
  // silhouette: require("../../../../assets/filters/silhouette.jpg"),
  // classic: require("../../../../assets/filters/classic.jpg"),
  // warm: require("../../../../assets/filters/warm.jpg"),
  // cool: require("../../../../assets/filters/cool.jpg"),
  // dramatic: require("../../../../assets/filters/dramatic.jpg"),
  // vintage: require("../../../../assets/filters/vintage.jpg"),
  // moon: require("../../../../assets/filters/moon.jpg"),
};

const FILTERS = [
  { id: "silhouette", label: "Original", tint: "#D9D9DE" },
  { id: "classic", label: "Classic", tint: "#5B8DEF" },
  { id: "warm", label: "Warm", tint: "#F2A65A" },
  { id: "normal", label: "Normal", none: true }, // plain white circle
  { id: "cool", label: "Cool", tint: "#6CC5D9" },
  { id: "dramatic", label: "Dramatic", tint: "#3A2E39" },
  { id: "vintage", label: "Vintage", tint: "#B08D57" },
  { id: "moon", label: "Moon", tint: "#7B7FA8" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Carousel geometry. Every item is ITEM_SIZE wide; the one at the centre is
// full size and the rest shrink with their distance from the centre.
const ITEM_SIZE = 44;
const ITEM_GAP = 4;
const STEP = ITEM_SIZE + ITEM_GAP;
const SCALE_NEAR = 0.82; // one slot away from centre
const SCALE_FAR = 0.68; // two or more slots away
const INITIAL_INDEX = Math.max(
  0,
  FILTERS.findIndex((f) => f.id === "normal"),
);

function formatDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function FilterItem({ filter, index, scrollX, onPress }) {
  const scale = scrollX.interpolate({
    inputRange: [
      (index - 2) * STEP,
      (index - 1) * STEP,
      index * STEP,
      (index + 1) * STEP,
      (index + 2) * STEP,
    ],
    outputRange: [SCALE_FAR, SCALE_NEAR, 1, SCALE_NEAR, SCALE_FAR],
    extrapolate: "clamp",
  });

  const thumb = THUMBS[filter.id];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        style={[
          styles.filterCircle,
          filter.none
            ? styles.filterCircleNone
            : { backgroundColor: filter.tint ?? "rgba(255,255,255,0.1)" },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${filter.label} filter`}
      >
        {thumb ? (
          <Image source={thumb} style={styles.filterThumb} resizeMode="cover" />
        ) : (
          <Icon
            name={filter.icon}
            size={filter.none ? 22 : 20}
            color={filter.none || filter.dark ? "#111111" : "#FFFFFF"}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

function CallFeed({
  facing,
  isFull,
  muted,
  cameraOff,
  onSwap,
  swapIcon,
  swapLabel,
}) {
  return (
    <View
      style={[styles.feed, isFull ? styles.feedFull : styles.feedPip]}
      pointerEvents={isFull ? "none" : "auto"}
    >
      <CameraView
        key="camera"
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        muted={muted}
        paused={false}
      />
      {cameraOff && (
        <View pointerEvents="none" style={styles.feedOverlay}>
          <Icon name="cameraOff" size={isFull ? 28 : 16} color="#FFFFFF" />
        </View>
      )}
      {!isFull && (
        <Pressable
          style={styles.previewSwapPill}
          onPress={onSwap}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={swapLabel}
        >
          <Icon name={swapIcon} size={14} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

export default function VideoCallScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const conversation = getConversation(id);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [facing, setFacing] = useState("back");
  const [previewFacing, setPreviewFacing] = useState("front");
  const [activeFilter, setActiveFilter] = useState(FILTERS[INITIAL_INDEX].id);
  const [previewIsFull, setPreviewIsFull] = useState(false);

  const filterScrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(INITIAL_INDEX * STEP)).current;
  const lastIndex = useRef(INITIAL_INDEX);

  // Drives the scale animation on the native thread and keeps the selected
  // filter in sync with whichever circle is closest to the centre, live.
  const onFilterScroll = useRef(
    Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
      useNativeDriver: true,
      listener: (e) => {
        const idx = Math.min(
          Math.max(Math.round(e.nativeEvent.contentOffset.x / STEP), 0),
          FILTERS.length - 1,
        );
        if (idx !== lastIndex.current) {
          lastIndex.current = idx;
          setActiveFilter(FILTERS[idx].id);
        }
      },
    }),
  ).current;

  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Start with "Normal" centred.
  useEffect(() => {
    const t = setTimeout(() => {
      filterScrollRef.current?.scrollTo({
        x: INITIAL_INDEX * STEP,
        y: 0,
        animated: false,
      });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const selectFilter = (index) => {
    filterScrollRef.current?.scrollTo({
      x: index * STEP,
      y: 0,
      animated: true,
    });
  };

  const toggleMic = () => setMuted((m) => !m);
  const toggleCameraOff = () => setCameraOff((c) => !c);
  const swapPreview = () => setPreviewIsFull((p) => !p);
  const toggleFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
    setPreviewFacing((current) => (current === "front" ? "back" : "front"));
  };
  const endCall = () => router.back();

  const name = conversation?.name ?? "Unknown";
  const activeFilterLabel =
    FILTERS.find((f) => f.id === activeFilter)?.label ?? "";

  return (
    <View style={styles.screen}>
      {/* Both feeds stay mounted; only their layout roles switch on PiP. */}
      <CallFeed
        key="receiver-feed"
        facing={facing}
        isFull={!previewIsFull}
        muted={muted || cameraOff}
        cameraOff={cameraOff}
        onSwap={swapPreview}
        swapIcon={previewIsFull ? "flipPiPExit" : "flipPiP"}
        swapLabel="Make receiver full screen"
      />
      <CallFeed
        key="self-feed"
        facing={previewFacing}
        isFull={previewIsFull}
        muted={muted || cameraOff}
        cameraOff={cameraOff}
        onSwap={swapPreview}
        swapIcon={previewIsFull ? "flipPiPExit" : "flipPiP"}
        swapLabel="Make self view full screen"
      />

      <View style={styles.recOverlay} pointerEvents="none">
        <View style={styles.receiverInfo}>
          <Text style={styles.receiverName} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.recRow}>
            <View style={styles.recDot} />
            <Text style={styles.callTimer}>{formatDuration(duration)}</Text>
          </View>
        </View>
      </View>

      {/* Left-side quick actions: rotate camera + add participant */}
      <View style={styles.leftControlsColumn}>
        <Pressable
          style={styles.leftControlBtn}
          onPress={toggleFacing}
          accessibilityRole="button"
          accessibilityLabel="Rotate camera"
        >
          <Icon name="rotateCamera" size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable
          style={styles.leftControlBtn}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Add participant"
        >
          <Icon name="addUser" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Filter carousel: "Filters" header pill, scaling circles, name pill */}
      <View style={styles.filterSection}>
        <View style={styles.filtersHeaderPill}>
          <Text style={styles.filtersHeaderText}>Filters</Text>
        </View>

        <Animated.ScrollView
          ref={filterScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterScroll}
          snapToInterval={STEP}
          snapToAlignment="start"
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onFilterScroll}
        >
          {FILTERS.map((f, i) => (
            <FilterItem
              key={f.id}
              filter={f}
              index={i}
              scrollX={scrollX}
              onPress={() => selectFilter(i)}
            />
          ))}
        </Animated.ScrollView>

        <View style={styles.filterNamePill}>
          <Icon name="sparkle" size={13} color="#FFFFFF" />
          <Text style={styles.filterNameText}>{activeFilterLabel}</Text>
        </View>
      </View>

      {/* Bottom call controls */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.controlBtn, cameraOff && styles.controlOff]}
          onPress={toggleCameraOff}
          accessibilityRole="button"
          accessibilityLabel={cameraOff ? "Turn on camera" : "Turn off camera"}
        >
          <Icon
            name={cameraOff ? "video" : "videoOff"}
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <Pressable
          style={styles.endCallBtn}
          onPress={endCall}
          accessibilityRole="button"
          accessibilityLabel="End call"
        >
          <Icon name="callEnd" size={28} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={[styles.controlBtn, muted && styles.controlOff]}
          onPress={toggleMic}
          accessibilityRole="button"
          accessibilityLabel={muted ? "Unmute" : "Mute"}
        >
          <Icon
            name={muted ? "micOff" : "microphone"}
            size={24}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000000" },

  feed: {
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  feedFull: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  feedPip: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 100,
    height: 150,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    zIndex: 2,
    elevation: 2,
  },
  feedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  receiverInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  receiverName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  recRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  callTimer: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontVariant: ["tabular-nums"],
  },
  previewSwapPill: {
    position: "absolute",
    bottom: 6,
    alignSelf: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  recOverlay: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 3,
  },

  leftControlsColumn: {
    position: "absolute",
    top: 168,
    left: 16,
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  leftControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",
  },

  // ---- Filter carousel ----
  filterSection: {
    position: "absolute",
    bottom: 126,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  filtersHeaderPill: {
    backgroundColor: "rgba(70,70,70,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 12,
  },
  filtersHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
  },
  filterScrollView: {
    width: SCREEN_WIDTH,
    flexGrow: 0,
  },
  filterScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: (SCREEN_WIDTH - ITEM_SIZE) / 2,
    gap: ITEM_GAP,
  },
  filterCircle: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  filterCircleNone: {
    backgroundColor: "#FFFFFF",
  },
  filterThumb: {
    width: "100%",
    height: "100%",
  },
  filterNamePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(70,70,70,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  filterNameText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
  },

  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 34,
  },
  controlBtn: {
    width: 54,
    height: 54,
    borderRadius: 32,
    backgroundColor: "rgba(120,120,128,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlOff: { backgroundColor: "#E5484D" },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E5484D",
    alignItems: "center",
    justifyContent: "center",
  },
});
