import { supabase } from '@lib/supabase/client'
import { QUERY_LIMIT } from '@utils/constants'
import { toWorkout } from './mappers'
import type { Workout } from './types'
import { WORKOUT_COLUMNS, WORKOUTS_TABLE } from './workouts.constants'

export const getWorkouts = async (userId: string): Promise<Workout[]> => {
  const { data, error } = await supabase
    .from(WORKOUTS_TABLE)
    .select(WORKOUT_COLUMNS)
    .eq('owner_id', userId)
    .eq('in_library', true)
    .order('sort_order')
    .order('created_at')
    .range(0, QUERY_LIMIT - 1)

  if (error) throw error

  return data.map(toWorkout)
}
