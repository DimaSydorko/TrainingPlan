import type { SEX, TRAINING_EXPERIENCE } from './profiles.constants'

export type Sex = (typeof SEX)[keyof typeof SEX]
export type TrainingExperience = (typeof TRAINING_EXPERIENCE)[keyof typeof TRAINING_EXPERIENCE]

export type Profile = {
  id: string
  displayName: string
  email: string
  photoUrl?: string
  legacyImportedAt?: string
  sex?: Sex
  trainingExperience?: TrainingExperience
  overallLevel?: string
  onboardedAt?: string
}

export type OnboardingAnswers = {
  sex?: Sex
  trainingExperience?: TrainingExperience
  bodyWeightKg?: number
}

export type CompleteOnboardingArgs = OnboardingAnswers & { userId: string; onboardedAt: string }
