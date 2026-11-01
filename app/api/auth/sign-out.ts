import { supabase } from '@lib/supabase/client'
import { toAuthRequestError } from './auth-request-error'

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut({ scope: 'local' })

  if (error) throw toAuthRequestError(error)
}
