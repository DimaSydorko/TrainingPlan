// Expo's Metro globals (process.env for EXPO_PUBLIC_* vars, require, module) so `tsc` works on a
// clean clone. Only metro-require is referenced, not the whole `expo/types`: its react-native-web
// augmentation (TextStyle.cursor: string) clashes with RN 0.86 ViewStyle.cursor and breaks
// app/Theme/Parents.tsx style unions. TODO(A5): fix those style types, then this can become
// `/// <reference types="expo/types" />` like the expo-env.d.ts that `expo start` generates.
/// <reference types="expo/types/metro-require" />
