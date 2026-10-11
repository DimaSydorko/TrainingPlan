import { ExpoConfig, ConfigContext } from 'expo/config'
import pkg from './package.json'

// Owned by A2 after Phase 0 (see docs/migration/README.md §5).
// Other agents only change their own plugin's options below. New plugins or
// permissions: ask A2 in your handoff, or add one clearly commented block.
//
// Build variants (set by eas.json, default production):
//   APP_VARIANT=development  "Training Plan (Dev)"      <id>.dev       dev client
//   APP_VARIANT=preview      "Training Plan (Preview)"  <id>.preview   internal testing
//   APP_VARIANT=production   "Training Plan"            <id>           store
// Each variant has its own application ID so it installs next to the store app. Each one therefore
// needs its own Google OAuth clients / Firebase app registration (see docs/migration/BUILD.md).

type AppVariant = 'development' | 'preview' | 'production'

const VARIANTS: Record<AppVariant, { nameSuffix: string; idSuffix: string }> = {
  development: { nameSuffix: ' (Dev)', idSuffix: '.dev' },
  preview: { nameSuffix: ' (Preview)', idSuffix: '.preview' },
  production: { nameSuffix: '', idSuffix: '' },
}

function getVariant(): AppVariant {
  const raw = process.env.APP_VARIANT ?? 'production'
  if (raw in VARIANTS) return raw as AppVariant
  throw new Error(`APP_VARIANT must be one of ${Object.keys(VARIANTS).join(', ')}; got "${raw}"`)
}

// D1: the Android package stays the published Play Store ID.
const ANDROID_PACKAGE = 'com.trainingplantogether_cli'
// D1 asked for the Android value on iOS too, but Apple bundle IDs only allow letters, digits, '-'
// and '.', so `com.trainingplantogether_cli` fails prebuild. The nearest valid value is used; the
// app was never on the App Store, so changing it later only means re-registering the iOS app in
// Firebase/Google Cloud. Open question for Dmytro in docs/migration/DECISIONS.md.
const IOS_BUNDLE_ID = 'com.trainingplantogether-cli'

// Same rule as iosUrlSchemeFromClientId in app/services/googleAuthCore.ts (unit-tested there).
// Duplicated because the Expo config loader cannot import other TypeScript files.
// `123-abc.apps.googleusercontent.com` -> `com.googleusercontent.apps.123-abc`
function iosUrlSchemeFromClientId(iosClientId?: string): string | undefined {
  const suffix = '.apps.googleusercontent.com'
  const id = iosClientId?.trim()
  if (!id || !id.endsWith(suffix) || id.length === suffix.length) return undefined
  return 'com.googleusercontent.apps.' + id.slice(0, -suffix.length)
}

// Written by `eas init` (or set EAS_PROJECT_ID). Needed for EAS Build and remote app versions.
const EAS_PROJECT_ID: string | undefined = process.env.EAS_PROJECT_ID || undefined

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = getVariant()
  const { nameSuffix, idSuffix } = VARIANTS[variant]

  // Google Sign-In on iOS needs the reversed iOS client ID as a URL scheme. Without it the plugin
  // throws, so local prebuilds without a .env skip it with a warning; EAS builds must have it.
  const googleIosUrlScheme = iosUrlSchemeFromClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)
  if (!googleIosUrlScheme) {
    const msg =
      'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is missing or not "<id>.apps.googleusercontent.com"; ' +
      'Google Sign-In will not work on iOS in this build.'
    if (process.env.EAS_BUILD === 'true' && process.env.EAS_BUILD_PLATFORM === 'ios') throw new Error(msg)
    if (process.env.EXPO_DEBUG || process.env.EAS_BUILD) console.warn(`[app.config] ${msg}`)
  }

  return {
    ...config,
    name: `Training Plan${nameSuffix}`,
    slug: 'training-plan',
    // Replaces the template `yourSchemeHere` scheme of the bare project. Dev/preview get their own
    // scheme so deep links don't open the wrong installed variant.
    scheme: `trainingplan${idSuffix.replace('.', '-')}`,
    version: pkg.version,
    orientation: 'portrait',
    icon: './app/Assets/icons/Icon.png',
    // The app has light and dark themes
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: IOS_BUNDLE_ID + idSuffix,
      supportsTablet: false,
      // buildNumber is managed by EAS (eas.json: appVersionSource "remote")
      // UIBackgroundModes: ['audio'] currently comes from expo-audio's default
      // enableBackgroundPlayback (A3 decides; see A0/A2 handoffs).
    },
    android: {
      package: ANDROID_PACKAGE + idSuffix,
      adaptiveIcon: {
        foregroundImage: './app/Assets/icons/Icon.png',
        backgroundColor: '#3DDC84',
      },
      // versionCode is managed by EAS (eas.json: appVersionSource "remote")
      // INTERNET is always added by Expo. Libraries add their own (expo-audio: MODIFY_AUDIO_SETTINGS,
      // FOREGROUND_SERVICE(_MEDIA_PLAYBACK) while background playback is on; expo-notifications:
      // RECEIVE_BOOT_COMPLETED). FOREGROUND_SERVICE/WAKE_LOCK from the bare manifest were for
      // react-native-background-actions, which D3 removes.
      permissions: [
        // usePlaying: Vibration.vibrate on exercise/timer/workout end (bare manifest had it)
        'VIBRATE',
        // A4 (D3): workout cue notifications on Android 13+ (expo-notifications also declares it)
        'POST_NOTIFICATIONS',
      ],
      // Added by Expo/RN templates but unused by the app
      blockedPermissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.RECORD_AUDIO',
      ],
    },
    plugins: [
      'expo-status-bar',
      'expo-font',
      'expo-dev-client',
      // TODO(A3): expo-audio options (background playback / audio session). Recording is not used.
      [
        'expo-audio',
        {
          microphonePermission: false,
          recordAudioAndroid: false,
        },
      ],
      // TODO(A4): expo-notifications options (icon, color, cue sounds)
      'expo-notifications',
      // Google Sign-In without google-services files (D2): only adds the iOS URL scheme.
      ...(googleIosUrlScheme
        ? [['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }] as [string, object]]
        : []),
      // No overrides: SDK 57 defaults for minSdkVersion / targetSdkVersion / compileSdkVersion and the
      // iOS deployment target are what we want. Add options here only with a written reason.
      'expo-build-properties',
    ],
    extra: {
      ...config.extra,
      appVariant: variant,
      ...(EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {}),
    },
  }
}
