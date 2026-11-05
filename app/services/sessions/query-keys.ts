export const sessionsKeys = {
  all: ['sessions'] as const,
  finish: () => [...sessionsKeys.all, 'finish'] as const,
}

// Invalidations:
// useFinishSession → sessionsKeys.all (no session queries yet; stats/progress screens add theirs here)
// useSignOut       → queryClient.clear()
