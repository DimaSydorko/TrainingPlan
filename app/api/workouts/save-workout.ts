import { supabase } from '@lib/supabase/client'
import type { Json } from '@lib/supabase/database.types'
import { toSaveWorkoutPayload } from './mappers'
import type { SaveWorkoutArgs } from './types'

export const saveWorkout = async ({ workout, isInLibrary = true }: SaveWorkoutArgs): Promise<string> => {
  const { data, error } = await supabase.rpc('save_workout', {
    p_workout: toSaveWorkoutPayload(workout, isInLibrary) as unknown as Json,
  })

  if (error) throw error

  return data
}
