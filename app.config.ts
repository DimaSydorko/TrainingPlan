import { ExpoConfig, ConfigContext } from 'expo/config'
import pkg from './package.json'

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

const ANDROID_PACKAGE = 'com.trainingplantogether_cli'
const IOS_BUNDLE_ID = 'com.trainingplantogether-cli'

function iosUrlSchemeFromClientId(iosClientId?: string): string | undefined {
  const suffix = '.apps.googleusercontent.com'
  const id = iosClientId?.trim()
  if (!id || !id.endsWith(suffix) || id.length === suffix.length) return undefined
  return 'com.googleusercontent.apps.' + id.slice(0, -suffix.length)
}

const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID || '6bc8e8ab-49fd-4cd2-8f0f-d4b522029833'

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = getVariant()
  const { nameSuffix, idSuffix } = VARIANTS[variant]

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
    slug: 'training-coach',
    scheme: `trainingplan${idSuffix.replace('.', '-')}`,
    version: pkg.version,
    orientation: 'portrait',
    icon: './app/assets/icons/icon.png',
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: IOS_BUNDLE_ID + idSuffix,
      supportsTablet: false,
    },
    android: {
      package: ANDROID_PACKAGE + idSuffix,
      adaptiveIcon: {
        foregroundImage: './app/assets/icons/icon.png',
        backgroundColor: '#3DDC84',
      },
      permissions: ['VIBRATE', 'POST_NOTIFICATIONS'],
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
      'expo-localization',
      // expo-audio: cue sounds only, no recording. Background playback is off: cues in the
      // background come from expo-notifications, and the session uses shouldPlayInBackground: false.
      // This keeps iOS UIBackgroundModes 'audio' and the Android mediaPlayback foreground service out.
      [
        'expo-audio',
        {
          microphonePermission: false,
          recordAudioAndroid: false,
          enableBackgroundPlayback: false,
        },
      ],
      [
        'expo-notifications',
        {
          color: '#3c8739',
          sounds: [
            './app/assets/sounds/bell.mp3',
            './app/assets/sounds/digital_clock.mp3',
            './app/assets/sounds/double_ding.mp3',
            './app/assets/sounds/hop_bell.mp3',
            './app/screens/playing-screen/notification-sounds/bell_cue.caf',
            './app/screens/playing-screen/notification-sounds/digital_clock_cue.caf',
            './app/screens/playing-screen/notification-sounds/double_ding_cue.caf',
            './app/screens/playing-screen/notification-sounds/hop_bell_cue.caf',
          ],
        },
      ],
      ...(googleIosUrlScheme
        ? [['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }] as [string, object]]
        : []),
      'expo-build-properties',
      '@react-native-vector-icons/material-design-icons',
    ],
    extra: {
      ...config.extra,
      appVariant: variant,
      ...(EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {}),
    },
  }
}
