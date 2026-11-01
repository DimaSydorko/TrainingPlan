import { supabase } from '@lib/supabase/client'
import { QUERY_LIMIT } from '@utils/constants'
import { toPlan } from './mappers'
import { PLAN_COLUMNS, PLANS_TABLE } from './plans.constants'
import type { Plan } from './types'

export const getPlans = async (userId: string): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from(PLANS_TABLE)
    .select(PLAN_COLUMNS)
    .eq('owner_id', userId)
    .order('sort_order')
    .order('created_at')
    .range(0, QUERY_LIMIT - 1)

  if (error) throw error

  return data.map(toPlan)
}
