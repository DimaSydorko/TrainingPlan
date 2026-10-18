/**
 * Runs before every test file (jest `setupFiles`). Registers module mocks for native modules and
 * backends that cannot run under Jest. See docs/migration/TESTING.md ("Unit tests") for the list and how to override them.
 *
 * `jest.doMock` is used (not hoisted `jest.mock`) so a mock can be registered as virtual while its
 * package is not installed yet (expo-speech / expo-keep-awake land with A3, google-signin with A2),
 * and as a normal mock once it is.
 */
function isInstalled(name) {
  try {
    require.resolve(name)
    return true
  } catch {
    return false
  }
}

function mockModule(name, factory) {
  jest.doMock(name, factory, { virtual: !isInstalled(name) })
}

// Storage and network state: the packages' own official Jest mocks.
mockModule('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)
mockModule('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock.js'))

// Expo native modules used behind the app/platform seams.
mockModule('expo-audio', () => require('./mocks/expo-audio'))
mockModule('expo-speech', () => require('./mocks/expo-speech'))
mockModule('expo-keep-awake', () => require('./mocks/expo-keep-awake'))
mockModule('expo-notifications', () => require('./mocks/expo-notifications'))

// Google Sign-In (A2 re-installs the package).
mockModule('@react-native-google-signin/google-signin', () => require('./mocks/google-signin'))

// Firebase JS SDK: compat entry points (Phase 0) and modular entry points (A1).
const firebaseEntryPoints = [
  'firebase/compat/app',
  'firebase/compat/auth',
  'firebase/compat/firestore',
  'firebase/compat/database',
  'firebase/compat/storage',
  'firebase/compat/functions',
  'firebase/app',
  'firebase/auth',
  'firebase/firestore',
  'firebase/database',
  'firebase/storage',
  'firebase/functions',
]
firebaseEntryPoints.forEach(name => {
  mockModule(name, () => require('./mocks/firebase').createStub(name))
})

// Keyboard controller (A5): the package's own Jest mock (its native module is not linked in Jest).
mockModule('react-native-keyboard-controller', () => require('react-native-keyboard-controller/jest'))

// Safe-area context (A5 added SafeAreaProvider at the root): without the official mock the
// provider waits for native inset metrics and renders nothing.
mockModule('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default)

// Reanimated 4 runs worklets on a native runtime; use the worklets package's own JS mock.
mockModule('react-native-worklets', () => require('react-native-worklets/src/mock'))

// Gesture handler's official setup (mocks the native module and the touchables).
require('react-native-gesture-handler/jestSetup')

// EXPO_PUBLIC_* values are inlined by babel-preset-expo at build time; in tests they are undefined
// unless a test sets them. Never put real credentials here.
