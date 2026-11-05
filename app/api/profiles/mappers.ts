import type { Tables } from '@lib/supabase/database.types'
import type { Profile, Sex, TrainingExperience } from './types'

type ProfileRow = Pick<
  Tables<'profiles'>,
  | 'id'
  | 'display_name'
  | 'email'
  | 'photo_url'
  | 'legacy_imported_at'
  | 'sex'
  | 'training_experience'
  | 'overall_level'
  | 'onboarded_at'
>

export const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  displayName: row.display_name,
  email: row.email,
  photoUrl: row.photo_url ?? undefined,
  legacyImportedAt: row.legacy_imported_at ?? undefined,
  sex: (row.sex as Sex | null) ?? undefined,
  trainingExperience: (row.training_experience as TrainingExperience | null) ?? undefined,
  overallLevel: row.overall_level ?? undefined,
  onboardedAt: row.onboarded_at ?? undefined,
})
