// ESLint flat config. Run with `npx expo lint` or `npm run lint`.
// Formatting is Prettier's job (`npm run format:check`); eslint-config-prettier turns off the
// stylistic rules that would fight it.
const { defineConfig, globalIgnores } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettierConfig = require('eslint-config-prettier/flat')
const globals = require('globals')
const checkFile = require('eslint-plugin-check-file')

// Libraries removed by the migration. Their replacements live behind the seams in app/platform and
// app/common/icon.
const removedLibraries = [
  { name: 'react-native-sound', message: 'Removed in the Expo migration. Use app/platform/audio.ts (expo-audio).' },
  { name: 'react-native-tts', message: 'Removed in the Expo migration. Use app/platform/speech.ts (expo-speech).' },
  {
    name: 'react-native-keep-awake',
    message: 'Removed in the Expo migration. Use app/platform/keep-awake.ts (expo-keep-awake).',
  },
  {
    name: 'react-native-background-actions',
    message: 'Removed in the Expo migration. Use app/platform/background-session.ts.',
  },
  { name: 'react-native-vector-icons', message: 'Removed in the Expo migration. Use app/common/icon.' },
  { name: '@expo/vector-icons', message: 'Deprecated since SDK 56. Use app/common/icon.' },
]
const removedLibraryPatterns = [
  { group: ['react-native-vector-icons/*'], message: 'Removed in the Expo migration. Use app/common/icon.' },
  { group: ['@expo/vector-icons/*'], message: 'Deprecated since SDK 56. Use app/common/icon.' },
]
const firebaseCompatPattern = {
  group: ['firebase/compat', 'firebase/compat/*'],
  message: 'Use the modular Firebase API (firebase/app, firebase/auth, firebase/firestore, ...).',
}

// Layer rules for the Supabase + React Query + Zustand target architecture (CLAUDE.md, .claude/contracts/server-state.md).
// In flat config a later `no-restricted-imports` entry replaces the earlier one for matching files, so every
// override repeats the base list.
const baseRestrictions = { paths: removedLibraries, patterns: [...removedLibraryPatterns, firebaseCompatPattern] }
const supabaseClientPatterns = [
  { group: ['@supabase/supabase-js', '@supabase/*'], message: 'Only app/lib/supabase and app/api talk to Supabase.' },
  {
    group: ['**/lib/supabase/*', '**/lib/supabase', '@lib/supabase', '@lib/supabase/*'],
    message: 'Only app/api imports the Supabase client.',
  },
]
const apiLayerPattern = {
  group: ['**/api/*', '**/api/**', '@api', '@api/*'],
  message: 'Import the React Query hook from app/services/<entity> instead of the fetcher.',
}
const restrictImports = (...patterns) => [
  'error',
  { paths: baseRestrictions.paths, patterns: [...baseRestrictions.patterns, ...patterns] },
]

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
    // Resolve tsconfig `paths` (@store/…) for the import/* rules.
    settings: { 'import/resolver': { typescript: { project: './tsconfig.json' }, node: true } },
  },
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
    // predates them; keep them visible as warnings until the code is cleaned up.
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
    },
  },
  {
    // New code uses `type`; existing interfaces are converted when touched (code-style.md).
    files: ['app/**/*.ts', 'app/**/*.tsx'],
    rules: { '@typescript-eslint/consistent-type-definitions': ['warn', 'type'] },
  },
  {
    // Fetchers: pure Supabase transport + mapping.
    files: ['app/api/**'],
    rules: {
      'no-restricted-imports': restrictImports(
        {
          group: ['@tanstack/*', 'react', 'react-native', 'react-redux', 'zustand', 'zustand/*'],
          message: 'app/api is pure transport.',
        },
        {
          group: [
            '**/services/*',
            '**/stores/*',
            '**/store/*',
            '**/screens/*',
            '**/components/*',
            '**/common/*',
            '@services',
            '@services/*',
            '@stores',
            '@stores/*',
            '@store',
            '@store/*',
            '@screens',
            '@screens/*',
            '@components',
            '@components/*',
            '@common',
            '@common/*',
          ],
          message: 'app/api must not depend on upper layers.',
        }
      ),
    },
  },
  {
    // React Query hooks: wrap fetchers, never the Supabase client; no store reads.
    files: ['app/services/**'],
    rules: {
      'no-restricted-imports': restrictImports(...supabaseClientPatterns, {
        group: [
          'react-redux',
          'zustand',
          'zustand/*',
          '**/stores/*',
          '**/store/*',
          '@stores',
          '@stores/*',
          '@store',
          '@store/*',
        ],
        message: 'Hooks take inputs as arguments; never read a store.',
      }),
    },
  },
  {
    // Everything above the data layer: screens, components, hooks, stores, routers.
    files: ['app/**'],
    ignores: ['app/api/**', 'app/services/**', 'app/lib/**', 'app/**/__tests__/**'],
    rules: { 'no-restricted-imports': restrictImports(...supabaseClientPatterns, apiLayerPattern) },
  },
  {
    // kebab-case paths. __tests__ is Jest's convention.
    files: ['app/**', '__tests__/**'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        { 'app/**/!(__tests__)/': 'KEBAB_CASE', '__tests__/**/!(__tests__)/': 'KEBAB_CASE' },
      ],
      'check-file/filename-naming-convention': [
        'error',
        { '{app,__tests__}/**/*.{ts,tsx,js}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
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
