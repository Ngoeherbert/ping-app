import {
  useNotifications,
  useFriends,
  useFollowings,
  useFollowers,
  getSocialState,
} from "../lib/stores/socialStore";

export function useSocialData() {
  const notifications = useNotifications();
  const friends = useFriends();
  const followings = useFollowings();
  const followers = useFollowers();

  return {
    notifications,
    friends,
    followings,
    followers,
    markAllNotificationsRead: getSocialState().markAllNotificationsRead,
    markNotificationRead: getSocialState().markNotificationRead,
    followUser: getSocialState().followUser,
  };
}
