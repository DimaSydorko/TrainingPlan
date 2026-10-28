/**
 * Jest config. Run with `npm test`.
 *
 * - Preset: jest-expo (iOS/Android-like RN environment, babel-preset-expo transform).
 * - All tests live in `app/__tests__/`: app-level tests at its root, unit tests in a mirror of the `app/`
 *   path they test (e.g. `app/__tests__/platform/media-utils.test.ts` for `app/platform/media-utils.ts`).
 *   Only `*.test.ts(x)` / `*.test.js` files are tests; setup, utils and fixtures are helpers.
 * - Native modules are mocked once in `app/__tests__/setup/` (see docs/testing.md).
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/app'],
  testMatch: ['<rootDir>/app/__tests__/**/*.test.[jt]s?(x)'],
  // tsconfig.json `paths` (@store/…, @utils/…); Jest doesn't read tsconfig.
  moduleNameMapper: {
    '^@(assets|common|components|hooks|platform|routers|screens|store|theme|utils|lib|api|services|stores|i18n)(/.*)?$':
      '<rootDir>/app/$1$2',
  },
  setupFiles: ['<rootDir>/app/__tests__/setup/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/app/__tests__/setup/jest.setupAfterEnv.js'],
  // Expo's recommended pattern plus the untranspiled JS-only RN libraries this app uses.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-native-google-signin|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-redux|redux|i18next|react-i18next|reselect|redux-persist|@reduxjs/toolkit|immer|nanoid|firebase|@firebase/.*))',
  ],
  modulePathIgnorePatterns: ['<rootDir>/admin/', '<rootDir>/android/', '<rootDir>/ios/', '<rootDir>/dist/'],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', '!app/__tests__/**', '!app/**/*.d.ts', '!app/assets/**'],
  clearMocks: true,
}
