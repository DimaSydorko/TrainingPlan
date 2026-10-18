---
name: services
description: Create a new server-state module for one entity — Supabase fetcher(s) in app/api/<entity>, React Query hooks and a query-key factory in app/services/<entity>, plus tests. Use when adding a new table/endpoint, a new query or mutation, or wiring a screen to Supabase data.
---

# New server-state module (Supabase + React Query)

> Durable rules: `.claude/contracts/server-state.md`. This file is the recipe. Group by **entity** (`plans`,
> `workouts`, `publications`, `profiles`, `exercise-images`), never by screen.

## Step 0 — Foundation exists?

Check `app/lib/supabase/client.ts`, `app/lib/supabase/database.types.ts` and `app/lib/query-client.ts`. If they are
missing, stop and run the foundation checkpoint of `firebase-to-supabase-react-query` first.

## Step 1 — Schema (if the table is new or changes)

```bash
npx supabase migration new <change-name>     # write SQL: table, updated_at trigger, RLS + policies
npx supabase db reset                        # apply locally
npx supabase gen types typescript --local > app/lib/supabase/database.types.ts
```

RLS enabled + explicit policies on every table. UUID primary keys the client can generate.

## Step 2 — Domain type and mapper — `app/api/<entity>/`

`app/api/plans/types.ts` holds the domain type (or reuse the existing one from `app/Utils/types.ts`).

`app/api/plans/mappers.ts`

```ts
import type { Tables, TablesInsert } from '../../lib/supabase/database.types'
import type { Plan } from './types'

type PlanRow = Tables<'plans'>

export const toPlan = (row: PlanRow): Plan => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  workoutIds: row.workout_ids ?? [],
  updatedAt: row.updated_at,
})

export const toPlanInsert = (plan: Plan): TablesInsert<'plans'> => ({
  id: plan.id,
  owner_id: plan.ownerId,
  name: plan.name,
  workout_ids: plan.workoutIds,
})
```

## Step 3 — Fetchers — one file per operation

`app/api/plans/get-plans.ts`

```ts
import { supabase } from '../../lib/supabase/client'
import { PLAN_COLUMNS, PLANS_PAGE_SIZE, PLANS_TABLE } from './plans.constants'
import { toPlan } from './mappers'
import type { Plan, UserId } from './types'

export type GetPlansArgs = { userId: UserId; page: number }

export const getPlans = async ({ userId, page }: GetPlansArgs): Promise<Plan[]> => {
  const from = page * PLANS_PAGE_SIZE
  const { data, error } = await supabase
    .from(PLANS_TABLE)
    .select(PLAN_COLUMNS)
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })
    .range(from, from + PLANS_PAGE_SIZE - 1)

  if (error) throw error

  return data.map(toPlan)
}
```

`app/api/plans/save-plan.ts` uses `.upsert(toPlanInsert(plan))` and throws on `error`.

## Step 4 — Query keys — `app/services/plans/query-keys.ts`

```ts
export const plansKeys = {
  all: ['plans'] as const,
  lists: () => [...plansKeys.all, 'list'] as const,
  list: (userId: UserId) => [...plansKeys.lists(), userId] as const,
  detail: (planId: PlanId) => [...plansKeys.all, 'detail', planId] as const,
}

export const plansMutationKeys = {
  save: ['plans', 'save'] as const,
  delete: ['plans', 'delete'] as const,
}

// Invalidations:
// useSavePlan   → plansKeys.list(userId) + plansKeys.detail(planId)
// useDeletePlan → plansKeys.list(userId)
```

## Step 5 — Hooks — one file per hook, default export

Query: `app/services/plans/use-plans.ts`

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

import { getPlans } from '../../api/plans/get-plans'
import { PLANS_PAGE_SIZE } from '../../api/plans/plans.constants'
import { plansKeys } from './query-keys'
import { PLANS_STALE_TIME_MS } from './plans.constants'

type UsePlansArgs = { userId?: UserId }

const usePlans = ({ userId }: UsePlansArgs) =>
  useInfiniteQuery({
    queryKey: plansKeys.list(userId ?? ''),
    queryFn: ({ pageParam }) => getPlans({ userId: userId!, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => (lastPage.length < PLANS_PAGE_SIZE ? undefined : pages.length),
    enabled: Boolean(userId),
    staleTime: PLANS_STALE_TIME_MS,
  })

export default usePlans
```

Offline-capable mutation: use the optimistic template in
`.claude/skills/firebase-to-supabase-react-query/references/optimistic-mutation-template.md`, give it
`mutationKey: plansMutationKeys.save`, and register the `mutationFn` in `app/lib/query-client.ts` with
`queryClient.setMutationDefaults(plansMutationKeys.save, { mutationFn: savePlan })`.

Online-only mutation (publish, copy publication): invalidate on success; the screen checks
`onlineManager.isOnline()` first and informs the user when offline.

## Step 6 — Tests

-   `app/api/plans/__tests__/mappers.test.ts` — row ↔ domain both ways, nullable columns.
-   `app/api/plans/__tests__/get-plans.test.ts` — mock `../../../lib/supabase/client`; success maps rows, `error`
    throws.
-   `app/services/plans/__tests__/use-plans.test.tsx` — `renderHook` with a fresh `QueryClient`
    (`retry: false`) wrapper; mock the fetcher module; assert data, `enabled` gating, and invalidation/rollback for
    mutations.

## Rules (ESLint-enforced)

-   `app/api/**` must not import `@tanstack/react-query`, `react`, `react-redux`, `zustand`, stores or screens.
-   `app/services/**` must not import `@supabase/supabase-js` or `app/lib/supabase/**`; it imports fetchers from
    `app/api`. Hooks never read stores — inputs are arguments.
-   Screens, components, hooks and stores must not import `app/api/**`, `app/lib/supabase/**` or
    `@supabase/supabase-js`.
-   `type` only, no `I` prefix, action-first names (`SavePlanArgs`).
