export const profilesKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profilesKeys.all, 'detail', userId] as const,
  completeOnboarding: () => [...profilesKeys.all, 'complete-onboarding'] as const,
}

// Invalidations:
// useCompleteOnboarding → profilesKeys.detail(userId) (optimistic)
// useLegacyImport       → profilesKeys.detail(userId)
// useSignOut            → queryClient.clear()
