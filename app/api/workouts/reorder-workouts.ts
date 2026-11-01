import { supabase } from '@lib/supabase/client'

export const reorderWorkouts = async (workoutIds: string[]): Promise<void> => {
  const { error } = await supabase.rpc('reorder_workouts', { p_ids: workoutIds })

  if (error) throw error
}
