import {
  useStories,
  useMyProfile,
  useActiveStory,
  useActiveStoryIndex,
  openStory,
  openStoryAt,
  closeStory,
  nextStory,
  prevStory,
  markSeen,
  startStory,
  createStory,
} from "../lib/stores/storyStore";

export function useStoriesData() {
  const stories = useStories();
  const myProfile = useMyProfile();
  const activeStory = useActiveStory();
  const activeStoryIndex = useActiveStoryIndex();

  return {
    stories,
    myProfile,
    activeStory,
    activeStoryIndex,
    onOpenStory: openStory,
    onOpenStoryAt: openStoryAt,
    onCloseStory: closeStory,
    onNextStory: nextStory,
    onPrevStory: prevStory,
    onMarkSeen: markSeen,
    onStartStory: startStory,
    onCreateStory: createStory,
  };
}
