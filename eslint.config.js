// ESLint flat config (owned by A7). Run with `npx expo lint` or `npm run lint`.
// Formatting is Prettier's job (`npm run format:check`); eslint-config-prettier turns off the
// stylistic rules that would fight it.
const { defineConfig, globalIgnores } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettierConfig = require('eslint-config-prettier/flat')
const globals = require('globals')

// Libraries removed by the migration. Their replacements live behind the seams in app/services and
// app/Common/Icon (docs/migration/README.md §6).
const removedLibraries = [
  { name: 'react-native-sound', message: 'Removed in the Expo migration. Use app/services/audio.ts (expo-audio).' },
  { name: 'react-native-tts', message: 'Removed in the Expo migration. Use app/services/speech.ts (expo-speech).' },
  {
    name: 'react-native-keep-awake',
    message: 'Removed in the Expo migration. Use app/services/keepAwake.ts (expo-keep-awake).',
  },
  {
    name: 'react-native-background-actions',
    message: 'Removed in the Expo migration. Use app/services/backgroundSession.ts.',
  },
  { name: 'react-native-vector-icons', message: 'Removed in the Expo migration. Use app/Common/Icon.' },
  { name: '@expo/vector-icons', message: 'Deprecated since SDK 56. Use app/Common/Icon.' },
]
const removedLibraryPatterns = [
  { group: ['react-native-vector-icons/*'], message: 'Removed in the Expo migration. Use app/Common/Icon.' },
  { group: ['@expo/vector-icons/*'], message: 'Deprecated since SDK 56. Use app/Common/Icon.' },
]
const firebaseCompatPattern = {
  group: ['firebase/compat', 'firebase/compat/*'],
  message: 'Use the modular Firebase API (firebase/app, firebase/auth, firebase/firestore, ...).',
}

module.exports = defineConfig([
  globalIgnores([
    'node_modules/**',
    'admin/**',
    'android/**',
    'ios/**',
    'dist/**',
    'web-build/**',
    '.expo/**',
    'coverage/**',
    'expo-env.d.ts',
  ]),
  expoConfig,
  prettierConfig,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'no-restricted-imports': [
        'error',
        { paths: removedLibraries, patterns: [...removedLibraryPatterns, firebaseCompatPattern] },
      ],
    },
  },
  {
    // eslint-plugin-react-hooks 7 ships the React Compiler rules as errors in `recommended`. The app
    // predates them; keep them visible as warnings until the code is cleaned up (see TESTING.md).
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/unsupported-syntax': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'react-hooks/config': 'warn',
      'react-hooks/gating': 'warn',
      // Pre-existing errors in app/ (Phase 1 must not autofix app/). TODO(A8): back to 'error' after
      // the Phase 2 fix pass. Locations are listed in docs/migration/handoff/A7.md.
      'react/jsx-key': 'warn',
      'react/display-name': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  {
    // Temporary exceptions: the seam implementations that still use a banned import.
    // TODO(A8): delete each entry once its owner has merged the replacement.
    files: ['app/Utils/firebase.ts', 'app/store/**'], // A1 converts compat to modular
    rules: {
      'no-restricted-imports': ['error', { paths: removedLibraries, patterns: removedLibraryPatterns }],
    },
  },
  {
    files: ['app/Common/Icon/Icon.tsx'], // A5 moves to @react-native-vector-icons/material-design-icons
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: removedLibraries.filter(p => p.name !== '@expo/vector-icons'),
          patterns: [removedLibraryPatterns[0], firebaseCompatPattern],
        },
      ],
    },
  },
  {
    // Node-side files: Jest/ESLint/Babel/Metro config and Jest setup.
    files: ['*.config.js', '.prettierrc.js', '__tests__/setup/**'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['__tests__/**', 'app/**/__tests__/**'],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
    // require() is idiomatic inside jest.mock factories and jest.isolateModules.
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
])
