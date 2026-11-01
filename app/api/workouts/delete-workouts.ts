import { supabase } from '@lib/supabase/client'
import { WORKOUTS_TABLE } from './workouts.constants'

export const deleteWorkouts = async (workoutIds: string[]): Promise<void> => {
  const { error } = await supabase.from(WORKOUTS_TABLE).delete().in('id', workoutIds)

  if (error) throw error
}
