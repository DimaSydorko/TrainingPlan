import { supabase } from '@lib/supabase/client'
import { toProfile } from './mappers'
import { PROFILE_COLUMNS, PROFILES_TABLE } from './profiles.constants'
import type { Profile } from './types'

export const getProfile = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabase.from(PROFILES_TABLE).select(PROFILE_COLUMNS).eq('id', userId).single()

  if (error) throw error

  return toProfile(data)
}
