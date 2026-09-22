import { Platform } from 'react-native';

export const shadows = {
  bar: Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 } },
    android: { elevation: 12 },
    default: {},
  }),
  card: Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 3 },
    default: {},
  }),
  fab: Platform.select({
    ios: { shadowColor: '#5B57FF', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
    android: { elevation: 8 },
    default: {},
  }),
};
export default shadows;
