export type AuthSession = {
  userId: string
  email: string
}

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'user_already_exists'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'rate_limited'
  | 'network'
  | 'google_unavailable'
  | 'unknown'

export type SignInWithPasswordArgs = {
  email: string
  password: string
}

export type SignUpArgs = {
  email: string
  password: string
  displayName: string
}

export type SignUpResult = {
  needsEmailConfirmation: boolean
}

export type AuthSessionListener = (session: AuthSession | null) => void
