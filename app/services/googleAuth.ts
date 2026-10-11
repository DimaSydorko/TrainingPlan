// Seam owned by A2 (docs/migration/README.md §6). Phase 0 stub.
// TODO(A2): implement with @react-native-google-signin/google-signin (current version + config plugin).
// configure: webClientId from process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (was GOOGLE_WEB_CLIENT_ID in
// constants.local.ts), offlineAccess: true, forceCodeForRefreshToken: true.
// getGoogleIdToken: hasPlayServices({ showPlayServicesUpdateDialog: true }) on Android, then signIn().
// signOutGoogle: the old code called revokeAccess() and then signOut().

export function configureGoogleSignIn(): void {
  console.warn('[stub] googleAuth.configureGoogleSignIn')
}

export async function getGoogleIdToken(): Promise<string> {
  throw new Error('Google sign-in not migrated yet')
}

export async function signOutGoogle(): Promise<void> {
  console.warn('[stub] googleAuth.signOutGoogle')
}
