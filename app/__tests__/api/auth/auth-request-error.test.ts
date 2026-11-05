import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { AuthRequestError, toAuthRequestError } from '@api/auth/auth-request-error'

describe('toAuthRequestError', () => {
  it.each([
    ['invalid_credentials', 'invalid_credentials'],
    ['user_already_exists', 'user_already_exists'],
    ['email_exists', 'user_already_exists'],
    ['email_not_confirmed', 'email_not_confirmed'],
    ['weak_password', 'weak_password'],
    ['over_request_rate_limit', 'rate_limited'],
    ['over_email_send_rate_limit', 'rate_limited'],
    ['something_new', 'unknown'],
  ])('maps Supabase code %s to %s', (supabaseCode, code) => {
    const error = toAuthRequestError(new AuthApiError('failed', 400, supabaseCode))

    expect(error).toBeInstanceOf(AuthRequestError)
    expect(error.code).toBe(code)
    expect(error.message).toBe('failed')
  })

  it('maps a retryable fetch error to network', () => {
    expect(toAuthRequestError(new AuthRetryableFetchError('offline', 0)).code).toBe('network')
  })

  it('maps a non-auth error to unknown', () => {
    expect(toAuthRequestError(new Error('boom')).code).toBe('unknown')
  })
})
