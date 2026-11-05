import { supabase } from '@lib/supabase/client'
import type { Json } from '@lib/supabase/database.types'
import { toSavePlanPayload } from './mappers'
import type { Plan } from './types'

export const savePlan = async (plan: Plan): Promise<string> => {
  const { data, error } = await supabase.rpc('save_plan', { p_plan: toSavePlanPayload(plan) as unknown as Json })

  if (error) throw error

  return data
}
