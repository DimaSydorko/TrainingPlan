import type { QueryClient } from '@tanstack/react-query'
import { completeOnboarding } from '@api/profiles/complete-onboarding'
import { PROFILE_MUTATION_SCOPE } from './profiles.constants'
import { profilesKeys } from './query-keys'
import type { CompleteOnboardingVariables } from './types'

export const registerProfilesMutationDefaults = (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(profilesKeys.completeOnboarding(), {
    mutationFn: (variables: CompleteOnboardingVariables) => completeOnboarding(variables),
    scope: { id: PROFILE_MUTATION_SCOPE },
  })
}
