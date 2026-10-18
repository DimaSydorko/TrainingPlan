// Pure helpers behind the googleAuth seam (A2). No React Native or native-module imports here,
// so this file can be unit-tested without mocks and imported from app.config.ts.

export type GoogleAuthErrorCode =
  /** The user closed the Google account picker. Not a failure: show no error. */
  | 'cancelled'
  /** A sign-in is already running (double tap). */
  | 'in_progress'
  /** Android: Google Play Services missing or outdated. */
  | 'play_services_unavailable'
  /** EXPO_PUBLIC_GOOGLE_* env vars are missing from this build. */
  | 'not_configured'
  /** Google returned no ID token (usually a wrong or missing web client ID). */
  | 'no_id_token'
  /** Android DEVELOPER_ERROR (code 10): SHA-1 / package name not registered for this build. */
  | 'developer_error'
  | 'unknown'

export class GoogleAuthError extends Error {
  readonly code: GoogleAuthErrorCode
  readonly cause?: unknown

  constructor(code: GoogleAuthErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'GoogleAuthError'
    this.code = code
    this.cause = cause
  }
}

/**
 * True when the error means "the user cancelled". Callers (UserAC, A1) should treat this as a
 * no-op and not show an error toast. Checks `code` rather than `instanceof` so it keeps working
 * across bundling or serialisation boundaries.
 */
export function isGoogleSignInCancelled(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'GoogleAuthError' &&
    (error as { code?: unknown }).code === 'cancelled'
  )
}

export type GoogleClientConfig = {
  webClientId?: string
  iosClientId?: string
}

/** Reads the client IDs from EXPO_PUBLIC_* values. Empty strings count as missing. */
export function readGoogleClientConfig(env: {
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?: string
}): GoogleClientConfig {
  const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined)
  return {
    webClientId: clean(env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    iosClientId: clean(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
  }
}

/** Names of the env vars a platform still needs, or [] when the config is complete. */
export function missingGoogleConfig(config: GoogleClientConfig, platform: string): string[] {
  const missing: string[] = []
  if (!config.webClientId) missing.push('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID')
  if (platform === 'ios' && !config.iosClientId) missing.push('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID')
  return missing
}

const GOOGLE_CLIENT_SUFFIX = '.apps.googleusercontent.com'
const GOOGLE_SCHEME_PREFIX = 'com.googleusercontent.apps.'

/**
 * The iOS URL scheme Google Sign-In needs is the reversed iOS client ID:
 * `123-abc.apps.googleusercontent.com` -> `com.googleusercontent.apps.123-abc`.
 * Returns undefined for an empty or malformed value.
 */
export function iosUrlSchemeFromClientId(iosClientId?: string): string | undefined {
  const id = iosClientId?.trim()
  if (!id || !id.endsWith(GOOGLE_CLIENT_SUFFIX)) return undefined
  const prefix = id.slice(0, -GOOGLE_CLIENT_SUFFIX.length)
  if (!prefix) return undefined
  return GOOGLE_SCHEME_PREFIX + prefix
}

/** Shape of the library's `signIn()` result we rely on (v13+). */
export type SignInResult = { type: 'success'; data: { idToken: string | null } } | { type: 'cancelled'; data: null }

/** Turns a `signIn()` result into the ID token, or throws a typed GoogleAuthError. */
export function idTokenFromSignInResult(result: SignInResult): string {
  if (result.type === 'cancelled') {
    throw new GoogleAuthError('cancelled', 'Google sign-in was cancelled')
  }
  const token = result.data?.idToken
  if (!token) {
    throw new GoogleAuthError(
      'no_id_token',
      'Google sign-in returned no ID token. Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.'
    )
  }
  return token
}

/** The library's runtime status codes (statusCodes from the package). */
export type GoogleStatusCodes = {
  SIGN_IN_CANCELLED: string
  IN_PROGRESS: string
  PLAY_SERVICES_NOT_AVAILABLE: string
}

const ANDROID_DEVELOPER_ERROR = '10'

/** Maps anything thrown by the library to a GoogleAuthError with a user-readable message. */
export function toGoogleAuthError(error: unknown, codes: GoogleStatusCodes): GoogleAuthError {
  if (error instanceof GoogleAuthError) return error
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : ''
  const message = error instanceof Error ? error.message : String(error ?? '')

  switch (code) {
    case codes.SIGN_IN_CANCELLED:
      return new GoogleAuthError('cancelled', 'Google sign-in was cancelled', error)
    case codes.IN_PROGRESS:
      return new GoogleAuthError('in_progress', 'Google sign-in is already in progress', error)
    case codes.PLAY_SERVICES_NOT_AVAILABLE:
      return new GoogleAuthError(
        'play_services_unavailable',
        'Google Play Services is not available or needs an update',
        error
      )
    case ANDROID_DEVELOPER_ERROR:
      return new GoogleAuthError(
        'developer_error',
        'Google sign-in is not set up for this build (DEVELOPER_ERROR). Register its SHA-1 in Firebase.',
        error
      )
    default:
      return new GoogleAuthError('unknown', message || 'Google sign-in failed', error)
  }
}
