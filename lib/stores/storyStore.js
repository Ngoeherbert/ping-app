import { create } from "zustand";
import { STORIES, MY_PROFILE } from "../mockData";

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
