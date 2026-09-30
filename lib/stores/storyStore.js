import { create } from "zustand";
import { STORIES, MY_PROFILE, MY_AVATAR, MY_USER_ID } from "../mockData";

const useStoryStoreBase = create(() => ({
  stories: STORIES,
  myProfile: MY_PROFILE,
  activeStory: null,
  startingStory: false,
}));

export const { getState: getStoryState, setState: setStoryState } = useStoryStoreBase;

export function useStoryStore() {
  return useStoryStoreBase(getStoryState);
}

export function useStories() {
  return useStoryStoreBase((state) => state.stories);
}

export function useMyProfile() {
  return useStoryStoreBase((state) => state.myProfile);
}

export const openStory = (story) => {
  setStoryState({ activeStory: story });
};

export const startStory = () => {
  setStoryState({ startingStory: true });
  setTimeout(() => setStoryState({ startingStory: false }), 500);
};

/**
 * Publishes a story owned by the signed-in user. It lands at the front of the
 * story row on Home so the composer has somewhere visible to send it.
 */
export const createStory = ({ cover }) => {
  const story = {
    id: `story-me-${Date.now()}`,
    userId: MY_USER_ID,
    name: MY_PROFILE.name,
    avatar: MY_AVATAR,
    cover,
    seen: false,
    mine: true,
  };
  setStoryState((state) => ({ stories: [story, ...state.stories] }));
  return story;
};
