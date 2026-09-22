import { Stack } from "expo-router";

// Nested stack inside the Gists tab.
// This keeps `index` + `[id]` under ONE tab ("Gists"),
// so the tab bar never shows "gists/index" or "gists/[id]" as extra tabs.
export default function GistsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
