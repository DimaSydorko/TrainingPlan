/**
 * @react-native-google-signin/google-signin mock (current API: signIn() resolves to
 * `{ type: 'success', data: { idToken, user } }`). Default: a successful sign-in with a fake token.
 * Override per test, e.g. `GoogleSignin.signIn.mockResolvedValueOnce({ type: 'cancelled', data: null })`.
 */
const React = require('react')

const user = {
  id: 'google-user-id',
  name: 'Test User',
  email: 'test@example.com',
  photo: null,
  familyName: 'User',
  givenName: 'Test',
}
const signInResult = {
  type: 'success',
  data: { idToken: 'mock-google-id-token', serverAuthCode: null, scopes: [], user },
}

const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn(async () => true),
  signIn: jest.fn(async () => signInResult),
  signInSilently: jest.fn(async () => signInResult),
  signOut: jest.fn(async () => null),
  revokeAccess: jest.fn(async () => null),
  hasPreviousSignIn: jest.fn(() => false),
  getCurrentUser: jest.fn(() => null),
  getTokens: jest.fn(async () => ({ idToken: 'mock-google-id-token', accessToken: 'mock-access-token' })),
  clearCachedAccessToken: jest.fn(async () => null),
}

const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
}

function GoogleSigninButton(props) {
  const { Pressable } = require('react-native')
  return React.createElement(Pressable, { accessibilityRole: 'button', testID: 'google-signin-button', ...props })
}
GoogleSigninButton.Size = { Icon: 2, Standard: 0, Wide: 1 }
GoogleSigninButton.Color = { Dark: 'dark', Light: 'light' }

module.exports = {
  __esModule: true,
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  isSuccessResponse: jest.fn(response => !!response && response.type === 'success'),
  isCancelledResponse: jest.fn(response => !!response && response.type === 'cancelled'),
  isNoSavedCredentialFoundResponse: jest.fn(response => !!response && response.type === 'noSavedCredentialFound'),
  isErrorWithCode: jest.fn(error => !!error && typeof error === 'object' && 'code' in error),
}
