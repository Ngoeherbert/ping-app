import { create } from "zustand";
import {
  getNotifications,
  USER_PROFILES,
  FRIENDS,
  FOLLOWINGS,
  FOLLOWERS,
} from "../mockData";

const store = create((set) => ({
  notifications: getNotifications(),
  friends: FRIENDS,
  followings: FOLLOWINGS,
  followers: FOLLOWERS,

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  followUser: (userId) => {
    set((state) => {
      const existingFollow = state.followings.find((f) => f.id === userId);
      if (existingFollow) {
        return {
          followings: state.followings.filter((f) => f.id !== userId),
        };
      }
      const profile = USER_PROFILES[String(userId)];
      if (!profile) return state;
      return {
        followings: [
          ...state.followings,
          {
            id: profile.id,
            name: profile.name,
            handle: profile.handle,
            avatar: profile.avatar,
            verified: profile.verified,
            verifiedVariant: profile.verifiedVariant,
          },
        ],
      };
    });
  },
}));

export const { getState: getSocialState } = store;

export function useNotifications() {
  return store((state) => state.notifications);
}

export function useFriends() {
  return store((state) => state.friends);
}

export function useFollowings() {
  return store((state) => state.followings);
}

export function useFollowers() {
  return store((state) => state.followers);
}
