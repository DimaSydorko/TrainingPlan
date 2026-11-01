import { supabase } from '@lib/supabase/client'
import { toAuthRequestError } from './auth-request-error'

export const signInWithGoogleIdToken = async (idToken: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })

  if (error) throw toAuthRequestError(error)
}
