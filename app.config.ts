import { ExpoConfig, ConfigContext } from 'expo/config'

// Owned by A2 after Phase 0 (see docs/migration/README.md §5).
// Other agents only change their own plugin's options below. New plugins or
// permissions: ask A2 in your handoff, or add one clearly commented block.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Training Plan',
  slug: 'training-plan',
  // Replaces the template `yourSchemeHere` scheme of the bare project
  scheme: 'trainingplan',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './app/Assets/icons/Icon.png',
  // The app has light and dark themes
  userInterfaceStyle: 'automatic',
  ios: {
    // D1 asked for the Android value, but Apple bundle IDs only allow letters, digits, '-' and '.',
    // so `com.trainingplantogether_cli` fails prebuild. Nearest valid value used until Dmytro confirms.
    // TODO(A2): confirm the final iOS bundle identifier with Dmytro (DECISIONS.md D1).
    bundleIdentifier: 'com.trainingplantogether-cli',
    supportsTablet: false,
  },
  android: {
    // D1: keep the existing Play Store identifier
    package: 'com.trainingplantogether_cli',
    adaptiveIcon: {
      foregroundImage: './app/Assets/icons/Icon.png',
      backgroundColor: '#3DDC84',
    },
    // TODO(A2): finalise permissions. The bare manifest had INTERNET, VIBRATE,
    // FOREGROUND_SERVICE and WAKE_LOCK (the last two were for react-native-background-actions).
    permissions: ['VIBRATE'],
  },
  plugins: [
    'expo-status-bar',
    'expo-font',
    // expo-audio (A3): cue sounds only, no recording. Background playback is off: per D3 cues in the
    // background come from expo-notifications (A4), and the session uses shouldPlayInBackground: false.
    // This keeps iOS UIBackgroundModes 'audio' and the Android mediaPlayback foreground service out.
    [
      'expo-audio',
      {
        microphonePermission: false,
        recordAudioAndroid: false,
        enableBackgroundPlayback: false,
      },
    ],
    // TODO(A4): expo-notifications options (icon, color, cue sounds)
    'expo-notifications',
    // TODO(A2): enable after `npx expo install @react-native-google-signin/google-signin`.
    // The package is not installed in Phase 0, so declaring the plugin now would break prebuild.
    // ['@react-native-google-signin/google-signin', { iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME }],
    // TODO(A2): expo-build-properties (override min/target SDK only with a reason)
    ['expo-build-properties', {}],
  ],
})
