// Seam owned by A2 (docs/migration/README.md §6).
// Backed by @react-native-google-signin/google-signin (v16, "original" Google Sign-In API) with
// its Expo config plugin in app.config.ts. Firebase uses the ID token (UserAC, A1).
//
// Config comes from EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (all platforms) and
// EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (iOS; we don't ship GoogleService-Info.plist, see D2).
// The old offlineAccess / forceCodeForRefreshToken options were dropped: the app only needs the
// ID token, and forceCodeForRefreshToken made Android show the consent screen on every sign-in.
import { Platform } from 'react-native'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import {
  GoogleAuthError,
  idTokenFromSignInResult,
  missingGoogleConfig,
  readGoogleClientConfig,
  toGoogleAuthError,
} from './google-auth-core'

export { GoogleAuthError, isGoogleSignInCancelled } from './google-auth-core'
export type { GoogleAuthErrorCode } from './google-auth-core'

// EXPO_PUBLIC_* must be referenced literally so Metro inlines them.
const config = readGoogleClientConfig({
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
})

let configured = false

/** Idempotent. Safe to call on every mount; does nothing if the env vars are missing. */
export function configureGoogleSignIn(): void {
  if (configured) return
  const missing = missingGoogleConfig(config, Platform.OS)
  if (missing.length) {
    // Without iosClientId the native iOS SDK cannot start, so don't call configure at all.
    console.warn(`[googleAuth] Google sign-in disabled, missing: ${missing.join(', ')}`)
    return
  }
  GoogleSignin.configure({
    webClientId: config.webClientId,
    ...(config.iosClientId ? { iosClientId: config.iosClientId } : {}),
  })
  configured = true
}

function ensureConfigured(): void {
  configureGoogleSignIn()
  if (!configured) {
    throw new GoogleAuthError(
      'not_configured',
      'Google sign-in is not configured in this build. Set ' + missingGoogleConfig(config, Platform.OS).join(', ')
    )
  }
}

/**
 * Shows the Google account picker and returns the ID token for Firebase.
 * Throws GoogleAuthError; `isGoogleSignInCancelled(e)` is true when the user backed out.
 */
export async function getGoogleIdToken(): Promise<string> {
  try {
    ensureConfigured()
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    }
    const result = await GoogleSignin.signIn()
    return idTokenFromSignInResult(result)
  } catch (e) {
    throw toGoogleAuthError(e, statusCodes)
  }
}

/**
 * Revokes the app's Google access and signs out of Google. Called on every app sign-out, also for
 * email users, so it never throws: a missing Google session or config is not an error here.
 */
export async function signOutGoogle(): Promise<void> {
  configureGoogleSignIn()
  if (!configured || !GoogleSignin.hasPreviousSignIn()) return
  try {
    await GoogleSignin.revokeAccess()
  } catch (e) {
    console.warn('[googleAuth] revokeAccess failed', e)
  }
  try {
    await GoogleSignin.signOut()
  } catch (e) {
    console.warn('[googleAuth] signOut failed', e)
  }
}
