import { supabase } from '@lib/supabase/client'
import { toProfile } from './mappers'
import { BODY_WEIGHTS_TABLE, PROFILE_COLUMNS, PROFILES_TABLE } from './profiles.constants'
import type { CompleteOnboardingArgs, Profile } from './types'

export const completeOnboarding = async ({
  userId,
  sex,
  trainingExperience,
  bodyWeightKg,
  onboardedAt,
}: CompleteOnboardingArgs): Promise<Profile> => {
  if (bodyWeightKg) {
    const { error } = await supabase
      .from(BODY_WEIGHTS_TABLE)
      .upsert({ user_id: userId, weight_kg: bodyWeightKg }, { onConflict: 'user_id,measured_on' })
    if (error) throw error
  }

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .update({
      ...(sex ? { sex } : {}),
      ...(trainingExperience ? { training_experience: trainingExperience } : {}),
      onboarded_at: onboardedAt,
    })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw error

  return toProfile(data)
}
