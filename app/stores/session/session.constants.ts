export const SESSION_STATUS = {
  LOADING: 'loading',
  SIGNED_IN: 'signedIn',
  SIGNED_OUT: 'signedOut',
} as const

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS]
