import React from "react";
import { View, StyleSheet, Platform, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSegments } from "expo-router";
import * as Haptics from "expo-haptics";
import Icon from "../ui/Icon";
import { palette } from "../../constants/colors";

/**
 * Tabs in order: home, reels, create (center FAB), gists/messages, profile.
 * Used as `tabBar={(props) => <TabBar {...props} />}` in app/(tabs)/_layout.jsx
 * Hidden on deep gist thread routes: (tabs)/gists/[id]
 */
const TABS = [
  { name: "index", label: "Home", icon: "home" },
  { name: "reels", label: "Reels", icon: "reels" },
  { name: "create", label: "Create", icon: "plus", fab: true },
  { name: "gists", label: "Gists", icon: "messages" },
  { name: "profile", label: "Profile", icon: "profile" },
];

export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  // Hide the tab bar inside a 1-1 gist thread: segments = ['(tabs)', 'gists', '[id]']
  const inThread = segments[0] === "(tabs)" && segments[1] === "gists" && segments.length > 2;
  if (inThread) return null;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TABS.find((t) => t.name === route.name) ?? {
            label: route.name,
            icon: "home",
          };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              Haptics.selectionAsync().catch(() => {});
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          if (tab.fab) {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                onPress={onPress}
                onLongPress={onLongPress}
                style={({ pressed }) => [
                  styles.fabOuter,
                  pressed && { transform: [{ scale: 0.94 }] },
                ]}
              >
                <View style={[styles.fab, isFocused && styles.fabActive]}>
                  <Icon name="plus" size={26} color="#FFFFFF" strokeWidth={2} />
                </View>
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          }

          const color = isFocused ? palette.ink : palette.muted;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <Icon
                  name={tab.icon}
                  size={24}
                  color={color}
                  strokeWidth={isFocused ? 2 : 1.5}
                />
                {tab.name === "gists" && <View style={styles.dot} />}
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 8,
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: 14,
  },
  tabPressed: { opacity: 0.6 },
  iconWrap: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: palette.primarySoft },
  label: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "600",
    color: palette.muted,
  },
  labelActive: { color: palette.ink },
  fabOuter: { flex: 1, alignItems: "center", justifyContent: "center" },
  fab: {
    width: 52,
    height: 36,
    marginTop: -22,
    borderRadius: 18,
    backgroundColor: palette.dark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: palette.background,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  fabActive: { backgroundColor: palette.primary },
  dot: {
    position: "absolute",
    top: 4,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.danger,
    borderWidth: 1.5,
    borderColor: palette.background,
  },
});

