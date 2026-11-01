import { supabase } from '@lib/supabase/client'
import { toAuthRequestError } from './auth-request-error'
import type { SignUpArgs, SignUpResult } from './types'

export const signUp = async ({ email, password, displayName }: SignUpArgs): Promise<SignUpResult> => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: displayName.trim() } },
  })

  if (error) throw toAuthRequestError(error)

  return { needsEmailConfirmation: !data.session }
}
