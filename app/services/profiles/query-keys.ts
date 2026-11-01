export const profilesKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profilesKeys.all, 'detail', userId] as const,
}

// Invalidations:
// useSignOut → queryClient.clear()
