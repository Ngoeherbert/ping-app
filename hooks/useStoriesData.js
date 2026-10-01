import {
  useStories,
  useMyProfile,
  useMyStories,
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
  deleteStory,
  updateStory,
  useStoryViewers,
  storyViewsCount,
} from "../lib/stores/storyStore";

export function useStoriesData() {
  const stories = useStories();
  const myProfile = useMyProfile();
  const myStories = useMyStories();
  const activeStory = useActiveStory();
  const activeStoryIndex = useActiveStoryIndex();

  return {
    stories,
    myProfile,
    myStories,
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
    onDeleteStory: deleteStory,
    onUpdateStory: updateStory,
    useStoryViewers,
    storyViewsCount,
  };
}
