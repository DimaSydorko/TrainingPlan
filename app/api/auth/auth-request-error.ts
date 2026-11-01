import { isAuthError, isAuthRetryableFetchError } from '@supabase/supabase-js'
import type { AuthErrorCode } from './types'

const SUPABASE_AUTH_ERROR_CODES: Record<string, AuthErrorCode> = {
  invalid_credentials: 'invalid_credentials',
  user_already_exists: 'user_already_exists',
  email_exists: 'user_already_exists',
  email_not_confirmed: 'email_not_confirmed',
  weak_password: 'weak_password',
  over_request_rate_limit: 'rate_limited',
  over_email_send_rate_limit: 'rate_limited',
}

export class AuthRequestError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthRequestError'
    this.code = code
  }
}

export const toAuthRequestError = (error: unknown): AuthRequestError => {
  const message = error instanceof Error ? error.message : String(error)

  if (isAuthRetryableFetchError(error)) return new AuthRequestError('network', message)

  const code = isAuthError(error) && error.code ? SUPABASE_AUTH_ERROR_CODES[error.code] : undefined

  return new AuthRequestError(code ?? 'unknown', message)
}
