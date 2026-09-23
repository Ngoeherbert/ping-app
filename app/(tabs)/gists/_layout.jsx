import { Stack } from "expo-router";

// Nested stack inside the Gists tab.
// This keeps `index` + `[id]` + nested screens under ONE tab ("Gists"),
// so the tab bar never shows nested routes as extra tabs.
export default function GistsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="[id]/chat-info" options={{ presentation: "card" }} />
      <Stack.Screen name="[id]/voice-call" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="[id]/video-call" options={{ presentation: "fullScreenModal" }} />
    </Stack>
  );
}
