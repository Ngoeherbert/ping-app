import { Tabs } from "expo-router";
import TabBar from "../../components/navigation/TabBar";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      backBehavior="history"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "#FFFFFF" } }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="reels" options={{ title: "Reels" }} />
      <Tabs.Screen name="create" options={{ title: "Create" }} />
      <Tabs.Screen name="gists" options={{ title: "Gists" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
