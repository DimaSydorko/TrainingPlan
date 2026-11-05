import { supabase } from '@lib/supabase/client'
import { toAuthSession } from './mappers'
import type { AuthSessionListener } from './types'

export const subscribeToAuthSession = (listener: AuthSessionListener): (() => void) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => listener(toAuthSession(session)))

  return () => data.subscription.unsubscribe()
}
