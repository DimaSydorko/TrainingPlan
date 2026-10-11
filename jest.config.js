/**
 * Jest config (owned by A7). Run with `npm test`.
 *
 * - Preset: jest-expo (iOS/Android-like RN environment, babel-preset-expo transform).
 * - Tests live in `__tests__/**` at the repo root and in `__tests__` folders next to the code they
 *   test inside `app/` (e.g. `app/services/__tests__/audio.test.ts`). Only `*.test.ts(x)` /
 *   `*.test.js` files are tests; other files in `__tests__` (setup, utils, fixtures) are helpers.
 * - Native modules are mocked once in `__tests__/setup/` (see docs/migration/TESTING.md).
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/__tests__', '<rootDir>/app'],
  testMatch: ['<rootDir>/__tests__/**/*.test.[jt]s?(x)', '<rootDir>/app/**/__tests__/**/*.test.[jt]s?(x)'],
  setupFiles: ['<rootDir>/__tests__/setup/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setupAfterEnv.js'],
  // Expo's recommended pattern plus the untranspiled JS-only RN libraries this app uses.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-native-google-signin|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-redux|redux-persist|@reduxjs/toolkit|immer|nanoid|firebase|@firebase/.*))',
  ],
  modulePathIgnorePatterns: ['<rootDir>/admin/', '<rootDir>/android/', '<rootDir>/ios/', '<rootDir>/dist/'],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', '!app/**/__tests__/**', '!app/**/*.d.ts', '!app/Assets/**'],
  clearMocks: true,
}
