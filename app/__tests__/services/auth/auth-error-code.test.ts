import { AuthRequestError } from '@api/auth/auth-request-error'
import { GoogleAuthError } from '@platform/google-auth'
import { getAuthErrorCode } from '@services/auth/auth-error-code'

describe('getAuthErrorCode', () => {
  it('returns null without an error', () => {
    expect(getAuthErrorCode(null)).toBeNull()
  })

  it('returns null when the user closed the Google picker', () => {
    expect(getAuthErrorCode(new GoogleAuthError('cancelled', 'cancelled'))).toBeNull()
  })

  it('returns the code of an AuthRequestError', () => {
    expect(getAuthErrorCode(new AuthRequestError('weak_password', 'weak'))).toBe('weak_password')
  })

  it('maps other Google errors to google_unavailable', () => {
    expect(getAuthErrorCode(new GoogleAuthError('developer_error', 'sha-1'))).toBe('google_unavailable')
  })

  it('maps anything else to unknown', () => {
    expect(getAuthErrorCode(new Error('boom'))).toBe('unknown')
  })
})
