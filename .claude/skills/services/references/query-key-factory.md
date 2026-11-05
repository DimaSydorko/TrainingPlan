# Query-key factory

One factory per entity at `app/services/<entity>/query-keys.ts`. Never inline key arrays.

```ts
export const workoutsKeys = {
  all: ['workouts'] as const,
  lists: () => [...workoutsKeys.all, 'list'] as const,
  list: (userId: UserId) => [...workoutsKeys.lists(), userId] as const,
  detail: (workoutId: WorkoutId) => [...workoutsKeys.all, 'detail', workoutId] as const,
}

export const workoutsMutationKeys = {
  save: ['workouts', 'save'] as const,
  delete: ['workouts', 'delete'] as const,
  reorder: ['workouts', 'reorder'] as const,
}

// Invalidations:
// useSaveWorkout     → workoutsKeys.list(userId) + workoutsKeys.detail(id)
// useDeleteWorkout   → workoutsKeys.list(userId) + plansKeys.lists() (plans reference workouts)
// usePublishWorkout  → publicationsKeys.lists() + workoutsKeys.detail(id)
```

## Rules

-   Every key extends `<entity>Keys.all` so logout/reset can remove the whole entity.
-   `as const` on every key.
-   Filter objects in keys are JSON-serializable and built from primitives — no fresh objects from render.
-   Mutation keys live next to query keys; every offline-capable mutation has one.
-   Keep the `// Invalidations:` block current, including cross-entity effects.
-   `type` only, no `I` prefix.
