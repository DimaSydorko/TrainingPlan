import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profilesKeys } from './query-keys'
import type { CompleteOnboardingVariables, OnboardingAnswers, Profile, ProfileSnapshot } from './types'

const useCompleteOnboarding = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<Profile, Error, CompleteOnboardingVariables, ProfileSnapshot>({
    mutationKey: profilesKeys.completeOnboarding(),
    onMutate: async ({ userId, sex, trainingExperience, onboardedAt }) => {
      const queryKey = profilesKeys.detail(userId)
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Profile>(queryKey)
      if (previous) {
        queryClient.setQueryData<Profile>(queryKey, {
          ...previous,
          sex: sex ?? previous.sex,
          trainingExperience: trainingExperience ?? previous.trainingExperience,
          onboardedAt,
        })
      }
      return { previous }
    },
    onError: (_error, { userId }, snapshot) => {
      if (snapshot?.previous) queryClient.setQueryData(profilesKeys.detail(userId), snapshot.previous)
    },
    onSettled: (_data, _error, { userId }) => queryClient.invalidateQueries({ queryKey: profilesKeys.detail(userId) }),
  })
  const { mutate } = mutation

  const completeOnboarding = useCallback(
    (userId: string, answers: OnboardingAnswers) =>
      mutate({ ...answers, userId, onboardedAt: new Date().toISOString() }),
    [mutate]
  )

  return { ...mutation, completeOnboarding }
}

export default useCompleteOnboarding
