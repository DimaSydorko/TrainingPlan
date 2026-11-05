export const PROFILES_TABLE = 'profiles'
export const BODY_WEIGHTS_TABLE = 'body_weights'
export const PROFILE_COLUMNS =
  'id, display_name, email, photo_url, legacy_imported_at, sex, training_experience, overall_level, onboarded_at'

export const SEX = {
  MALE: 'male',
  FEMALE: 'female',
} as const

export const TRAINING_EXPERIENCE = {
  NEVER: 'never',
  LESS_THAN_YEAR: 'lt_1y',
  ONE_TO_THREE_YEARS: '1_3y',
  OVER_THREE_YEARS: '3y_plus',
} as const
