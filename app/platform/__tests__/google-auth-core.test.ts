import {
  GoogleAuthError,
  idTokenFromSignInResult,
  iosUrlSchemeFromClientId,
  isGoogleSignInCancelled,
  missingGoogleConfig,
  readGoogleClientConfig,
  toGoogleAuthError,
} from '../google-auth-core'

const codes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
}

const codeError = (code: string, message = 'native') => Object.assign(new Error(message), { code })

describe('idTokenFromSignInResult', () => {
  it('returns the token on success', () => {
    expect(idTokenFromSignInResult({ type: 'success', data: { idToken: 'tok' } })).toBe('tok')
  })

  it('throws a cancelled error on cancel', () => {
    let caught: unknown
    try {
      idTokenFromSignInResult({ type: 'cancelled', data: null })
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(GoogleAuthError)
    expect(isGoogleSignInCancelled(caught)).toBe(true)
  })

  it('throws no_id_token when the token is missing', () => {
    expect(() => idTokenFromSignInResult({ type: 'success', data: { idToken: null } })).toThrow(
      expect.objectContaining({ code: 'no_id_token' })
    )
  })
})

describe('toGoogleAuthError', () => {
  it.each([
    ['SIGN_IN_CANCELLED', 'cancelled'],
    ['IN_PROGRESS', 'in_progress'],
    ['PLAY_SERVICES_NOT_AVAILABLE', 'play_services_unavailable'],
    ['10', 'developer_error'],
    ['something', 'unknown'],
  ])('maps native code %s to %s', (native, expected) => {
    expect(toGoogleAuthError(codeError(native), codes).code).toBe(expected)
  })

  it('keeps an existing GoogleAuthError', () => {
    const err = new GoogleAuthError('not_configured', 'x')
    expect(toGoogleAuthError(err, codes)).toBe(err)
  })

  it('keeps the message of unknown errors', () => {
    expect(toGoogleAuthError(new Error('boom'), codes).message).toBe('boom')
  })

  it('only the cancel code counts as cancelled', () => {
    expect(isGoogleSignInCancelled(toGoogleAuthError(codeError('IN_PROGRESS'), codes))).toBe(false)
    expect(isGoogleSignInCancelled(new Error('cancelled'))).toBe(false)
    expect(isGoogleSignInCancelled(null)).toBe(false)
  })
})

describe('config helpers', () => {
  it('treats blank env values as missing', () => {
    const config = readGoogleClientConfig({
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: '  ',
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: '',
    })
    expect(config).toEqual({ webClientId: undefined, iosClientId: undefined })
  })

  it('lists what each platform still needs', () => {
    expect(missingGoogleConfig({}, 'android')).toEqual(['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'])
    expect(missingGoogleConfig({ webClientId: 'w' }, 'ios')).toEqual(['EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'])
    expect(missingGoogleConfig({ webClientId: 'w', iosClientId: 'i' }, 'ios')).toEqual([])
  })

  it('reverses the iOS client ID into the URL scheme', () => {
    expect(iosUrlSchemeFromClientId('123-abc.apps.googleusercontent.com')).toBe('com.googleusercontent.apps.123-abc')
    expect(iosUrlSchemeFromClientId(undefined)).toBeUndefined()
    expect(iosUrlSchemeFromClientId('not-a-client-id')).toBeUndefined()
    expect(iosUrlSchemeFromClientId('.apps.googleusercontent.com')).toBeUndefined()
  })
})
