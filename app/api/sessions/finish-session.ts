import { supabase } from '@lib/supabase/client'
import type { Json } from '@lib/supabase/database.types'
import { toFinishSessionResult, toSessionPayload, toSetPayload } from './mappers'
import type { FinishSessionArgs, FinishSessionResult } from './types'

export const finishSession = async ({ session, sets }: FinishSessionArgs): Promise<FinishSessionResult> => {
  const { data, error } = await supabase.rpc('finish_session', {
    p_session: toSessionPayload(session) as unknown as Json,
    p_sets: sets.map(toSetPayload) as unknown as Json,
  })

  if (error) throw error

  return toFinishSessionResult(data)
}
