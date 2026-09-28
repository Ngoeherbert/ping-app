import { useStories, useMyProfile, openStory, startStory } from "../lib/stores/storyStore";

export function useStoriesData() {
  const stories = useStories();
  const myProfile = useMyProfile();

  return {
    stories,
    myProfile,
    onOpenStory: openStory,
    onStartStory: startStory,
  };
}
