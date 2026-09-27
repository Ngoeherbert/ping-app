import { Stack } from "expo-router";

// Nested stack inside the Gists tab.
// This keeps `index` + `[id]` + nested screens under ONE tab ("Gists"),
// so the tab bar never shows nested routes as extra tabs.
//
// The call screens hang off `[id]` only. The AI subtree has no voice- or
// video-call route and no call buttons anywhere in it — there is no one on the
// other end to ring, and those routes need a real conversation id to resolve
// against. Keep it that way: an AI screen that grows a call button will route
// into a thread that does not exist.
export default function GistsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ai" />
      <Stack.Screen name="ai/chat-info" />
      <Stack.Screen name="ai/voice" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="[id]/chat-info" options={{ presentation: "card" }} />
      <Stack.Screen name="[id]/voice-call" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="[id]/video-call" options={{ presentation: "fullScreenModal" }} />
    </Stack>
  );
}
