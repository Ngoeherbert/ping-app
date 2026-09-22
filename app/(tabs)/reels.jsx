import React from "react";
import { View, Text, StyleSheet, FlatList, Dimensions } from "react-native";
import PhoneScreen from "../../components/navigation/PhoneScreen";
import Icon from "../../components/ui/Icon";
import { palette } from "../../constants/colors";

const { width } = Dimensions.get("window");
const CARD = (width - 48) / 2;

const REELS = [
  { id: "1", user: "@adaeze", views: "12.4k", h: 220 },
  { id: "2", user: "@kwame", views: "8.1k", h: 170 },
  { id: "3", user: "@ping", views: "102k", h: 200 },
  { id: "4", user: "@zuri", views: "3.2k", h: 240 },
];

export default function ReelsScreen() {
  return (
    <PhoneScreen>
      <Text style={styles.title}>Reels</Text>
      <Text style={styles.sub}>Short video from people you follow</Text>
      <FlatList
        data={REELS}
        numColumns={2}
        keyExtractor={(i) => i.id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, paddingTop: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.reel, { height: item.h }]}>
            <View style={styles.play}>
              <Icon name="play" size={22} color="#fff" />
            </View>
            <Text style={styles.user}>{item.user}</Text>
            <Text style={styles.views}>{item.views} views</Text>
          </View>
        )}
      />
    </PhoneScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: palette.ink },
  sub: { fontSize: 14, color: palette.muted, marginTop: 2 },
  reel: {
    width: CARD,
    backgroundColor: palette.dark,
    borderRadius: 18,
    padding: 12,
    justifyContent: "flex-end",
  },
  play: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  user: { color: "#fff", fontWeight: "700", fontSize: 14 },
  views: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
});
