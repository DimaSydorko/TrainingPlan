import type { Session } from '@supabase/supabase-js'
import type { AuthSession } from './types'

export const toAuthSession = (session: Session | null): AuthSession | null =>
  session?.user ? { userId: session.user.id, email: session.user.email ?? '' } : null
