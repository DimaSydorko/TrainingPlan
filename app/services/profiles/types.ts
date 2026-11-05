import type { OnboardingAnswers, Profile } from '@api/profiles/types'

export type { OnboardingAnswers, Profile, Sex, TrainingExperience } from '@api/profiles/types'

export type CompleteOnboardingVariables = OnboardingAnswers & { userId: string; onboardedAt: string }
export type ProfileSnapshot = { previous?: Profile }
