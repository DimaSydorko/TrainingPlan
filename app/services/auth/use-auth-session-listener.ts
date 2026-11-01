import { useEffect } from 'react'
import { subscribeToAuthSession } from '@api/auth/subscribe-to-auth-session'
import type { AuthSessionListener } from '@api/auth/types'

const useAuthSessionListener = (onSessionChange: AuthSessionListener) => {
  useEffect(() => subscribeToAuthSession(onSessionChange), [onSessionChange])
}

export default useAuthSessionListener
