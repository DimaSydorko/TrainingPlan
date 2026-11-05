import * as React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import AppText from '@common/app-text/app-text'
import { getAuthErrorCode } from '@services/auth/auth-error-code'
import type { AuthErrorCode } from '@services/auth/types'

type AuthErrorTextProps = {
  error: unknown
}

const AUTH_ERROR_MESSAGE_KEY = {
  invalid_credentials: 'auth:errors.invalid_credentials',
  user_already_exists: 'auth:errors.user_already_exists',
  email_not_confirmed: 'auth:errors.email_not_confirmed',
  weak_password: 'auth:errors.weak_password',
  rate_limited: 'auth:errors.rate_limited',
  network: 'auth:errors.network',
  google_unavailable: 'auth:errors.google_unavailable',
  unknown: 'auth:errors.unknown',
} as const satisfies Record<AuthErrorCode, string>

export default memo(function AuthErrorText({ error }: AuthErrorTextProps) {
  const { t } = useTranslation('auth')
  const errorCode = getAuthErrorCode(error)

  if (!errorCode) return null

  return (
    <AppText variant='caption' tone='danger' testID='auth.error'>
      {t(AUTH_ERROR_MESSAGE_KEY[errorCode])}
    </AppText>
  )
})
