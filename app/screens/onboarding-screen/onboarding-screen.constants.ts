export const ONBOARDING_STEP = {
  SEX: 'sex',
  EXPERIENCE: 'experience',
  BODY_WEIGHT: 'bodyWeight',
} as const

export const ONBOARDING_STEPS = [ONBOARDING_STEP.SEX, ONBOARDING_STEP.EXPERIENCE, ONBOARDING_STEP.BODY_WEIGHT] as const

export const BODY_WEIGHT_LIMITS_KG = { MIN: 20, MAX: 400 } as const
