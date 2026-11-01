import { supabase } from '@lib/supabase/client'
import { toAuthRequestError } from './auth-request-error'
import type { SignInWithPasswordArgs } from './types'

export const signInWithPassword = async ({ email, password }: SignInWithPasswordArgs): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

  if (error) throw toAuthRequestError(error)
}
