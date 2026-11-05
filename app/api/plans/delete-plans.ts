import { supabase } from '@lib/supabase/client'

export const deletePlans = async (planIds: string[]): Promise<void> => {
  for (const planId of planIds) {
    const { error } = await supabase.rpc('delete_plan', { p_plan_id: planId })
    if (error) throw error
  }
}
