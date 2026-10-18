# Hook templates

Each hook pairs a **fetcher** in `app/api/<entity>/` (Supabase + mapping, no React Query) with a **hook** in
`app/services/<entity>/`.

## Query

`app/api/workouts/get-workout.ts`

```ts
import { supabase } from '@lib/supabase/client'
import { toWorkout } from './mappers'
import { WORKOUT_COLUMNS, WORKOUTS_TABLE } from './workouts.constants'
import type { Workout, WorkoutId } from './types'

export const getWorkout = async (workoutId: WorkoutId): Promise<Workout> => {
  const { data, error } = await supabase.from(WORKOUTS_TABLE).select(WORKOUT_COLUMNS).eq('id', workoutId).single()

  if (error) throw error

  return toWorkout(data)
}
```

`app/services/workouts/use-workout.ts`

```ts
import { useQuery } from '@tanstack/react-query'

import { getWorkout } from '@api/workouts/get-workout'
import { workoutsKeys } from './query-keys'
import { WORKOUTS_STALE_TIME_MS } from './workouts.constants'

const useWorkout = (workoutId?: WorkoutId) =>
  useQuery({
    queryKey: workoutsKeys.detail(workoutId ?? ''),
    queryFn: () => getWorkout(workoutId!),
    enabled: Boolean(workoutId),
    staleTime: WORKOUTS_STALE_TIME_MS,
  })

export default useWorkout
```

## Mutation — invalidate (online-only actions)

`app/services/publications/use-publish-workout.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { publishWorkout } from '@api/publications/publish-workout'
import { workoutsKeys } from '../workouts/query-keys'
import { publicationsKeys } from './query-keys'

const usePublishWorkout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishWorkout,
    onSuccess: (_data, { workoutId }) => {
      queryClient.invalidateQueries({ queryKey: publicationsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workoutsKeys.detail(workoutId) })
    },
  })
}

export default usePublishWorkout
```

## Rules

-   Never call `supabase` inside `queryFn` / `mutationFn` — import the fetcher.
-   Fetchers throw on `error`; hooks don't catch to hide errors (the global `MutationCache`/`QueryCache` `onError`
    shows the toast).
-   Hook inputs are arguments; never read a store inside.
-   `enabled` for every nullable input.
-   `staleTime` from `stale-time-rubric.md`, stored in the entity's `*.constants.ts`.
-   Default home is `app/services/<entity>/`. A screen-local hook (`app/screens/<screen-name>/hooks/`) only adds
    composition on top; it never re-declares a query or key.
