// Pulls in Expo's global types (process.env for EXPO_PUBLIC_* vars, Metro require, etc.).
// `expo start` also generates a gitignored expo-env.d.ts with the same reference; this file
// makes `tsc` work on a clean clone without running the dev server first.
/// <reference types="expo/types" />
