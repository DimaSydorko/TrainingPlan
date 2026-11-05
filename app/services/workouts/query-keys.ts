export const workoutsKeys = {
  all: ['workouts'] as const,
  lists: () => [...workoutsKeys.all, 'list'] as const,
  list: (userId: string) => [...workoutsKeys.lists(), userId] as const,
  save: () => [...workoutsKeys.all, 'save'] as const,
  delete: () => [...workoutsKeys.all, 'delete'] as const,
  reorder: () => [...workoutsKeys.all, 'reorder'] as const,
}

// Invalidations:
// useSaveWorkout     → workoutsKeys.list(userId) (optimistic upsert)
// useDeleteWorkouts  → workoutsKeys.list(userId) (optimistic remove)
// useReorderWorkouts → workoutsKeys.list(userId) (optimistic reorder)
// useLegacyImport    → workoutsKeys.all + profilesKeys.detail(userId)
// useSignOut         → queryClient.clear()
