# Optimistic, offline-capable mutation

Use for the user's own data that must work offline (create/edit/reorder/delete plans and workouts, saving results).
Online-only actions use the invalidate template in `hook-templates.md`.

## Fetcher

`app/api/workouts/save-workout.ts`

```ts
import { supabase } from '../../lib/supabase/client'
import { toWorkoutUpsert } from './mappers'
import { WORKOUTS_TABLE } from './workouts.constants'
import type { Workout } from './types'

export type SaveWorkoutArgs = { workout: Workout }

export const saveWorkout = async ({ workout }: SaveWorkoutArgs): Promise<void> => {
  const { error } = await supabase.from(WORKOUTS_TABLE).upsert(toWorkoutUpsert(workout))

  if (error) throw error
}
```

## Register the mutationFn (so paused mutations resume after a restart)

`app/lib/query-client.ts`

```ts
queryClient.setMutationDefaults(workoutsMutationKeys.save, { mutationFn: saveWorkout })
```

## Hook

`app/services/workouts/use-save-workout.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { SaveWorkoutArgs } from '../../api/workouts/save-workout'
import type { Workout } from '../../api/workouts/types'
import { workoutsKeys, workoutsMutationKeys } from './query-keys'

type UseSaveWorkoutArgs = { userId: UserId }

const useSaveWorkout = ({ userId }: UseSaveWorkoutArgs) => {
  const queryClient = useQueryClient()
  const listKey = workoutsKeys.list(userId)

  return useMutation<void, Error, SaveWorkoutArgs, { previous?: Workout[] }>({
    mutationKey: workoutsMutationKeys.save,
    onMutate: async ({ workout }) => {
      await queryClient.cancelQueries({ queryKey: listKey })

      const previous = queryClient.getQueryData<Workout[]>(listKey)

      queryClient.setQueryData<Workout[]>(listKey, old => [
        workout,
        ...(old ?? []).filter(item => item.id !== workout.id),
      ])
      queryClient.setQueryData(workoutsKeys.detail(workout.id), workout)

      return { previous }
    },
    onError: (_error, _args, context) => {
      queryClient.setQueryData(listKey, context?.previous)
    },
    onSettled: (_data, _error, { workout }) => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: workoutsKeys.detail(workout.id) })
    },
  })
}

export default useSaveWorkout
```

## Required steps

1. `mutationKey` + `setMutationDefaults` registration (offline resume)
2. Client-generated id on create (`randomUUID()` from `expo-crypto`) so the optimistic item keeps its id
3. `cancelQueries` before touching the cache
4. Snapshot into the context
5. `setQueryData` optimistic update
6. Roll back in `onError`
7. `invalidateQueries` in `onSettled`

Infinite lists (`useInfiniteQuery`) store `{ pages, pageParams }` — update `pages[0]` instead of a flat array.
