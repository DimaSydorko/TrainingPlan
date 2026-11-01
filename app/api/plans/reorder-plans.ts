import { supabase } from '@lib/supabase/client'

export const reorderPlans = async (planIds: string[]): Promise<void> => {
  const { error } = await supabase.rpc('reorder_plans', { p_ids: planIds })

  if (error) throw error
}
