import { AuthRequestError } from '@api/auth/auth-request-error'
import { GoogleAuthError, isGoogleSignInCancelled } from '@platform/google-auth'
import type { AuthErrorCode } from '@api/auth/types'

export const getAuthErrorCode = (error: unknown): AuthErrorCode | null => {
  if (!error || isGoogleSignInCancelled(error)) return null
  if (error instanceof AuthRequestError) return error.code
  if (error instanceof GoogleAuthError) return 'google_unavailable'

  return 'unknown'
}
