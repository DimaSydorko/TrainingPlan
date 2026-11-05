export const plansKeys = {
  all: ['plans'] as const,
  lists: () => [...plansKeys.all, 'list'] as const,
  list: (userId: string) => [...plansKeys.lists(), userId] as const,
  save: () => [...plansKeys.all, 'save'] as const,
  saveWorkout: () => [...plansKeys.all, 'save-workout'] as const,
  delete: () => [...plansKeys.all, 'delete'] as const,
  reorder: () => [...plansKeys.all, 'reorder'] as const,
}

// Invalidations:
// useSavePlan        → plansKeys.list(userId) (optimistic upsert)
// useSavePlanWorkout → plansKeys.list(userId) (optimistic replace inside the plan)
// useDeletePlans     → plansKeys.list(userId) (optimistic remove)
// useReorderPlans    → plansKeys.list(userId) (optimistic reorder)
// useLegacyImport    → plansKeys.all
// useSignOut         → queryClient.clear()
