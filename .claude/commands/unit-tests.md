# Unit Tests

You are writing or reviewing unit tests for this Expo / React Native app. Follow this guide exactly.

## Stack

| Tool                                | Purpose                                                              |
| ----------------------------------- | -------------------------------------------------------------------- |
| Jest 29 + `jest-expo` preset        | Test runner, RN-like environment                                     |
| `@testing-library/react-native` 14  | Rendering, queries, `userEvent`, matchers (`toBeOnTheScreen`, …)     |
| `__tests__/setup/`                  | Global native mocks (AsyncStorage, NetInfo, expo-audio, expo-speech, expo-notifications, google-signin, Firebase) |
| `__tests__/utils/`                  | `renderWithStore`, `createTestStore` (legacy Redux); add `renderWithQueryClient` with the React Query foundation |

**RNTL 14 is async:** `await render(...)`, `await user.press(...)`, `await fireEvent.press(...)`.

---

## Step 1 — Test file location

Tests live in a `__tests__` folder next to the code and are named `*.test.ts(x)`:

| Source                                         | Test                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `app/Utils/<file>.ts`, `app/platform/<file>.ts` | `…/__tests__/<file>.test.ts`                                |
| `app/Common/<Name>/<Name>.tsx` / `app/Components/<name>/<name>.tsx` | `…/<name>/__tests__/<name>.test.tsx`    |
| `app/api/<entity>/<operation>.ts`              | `app/api/<entity>/__tests__/<operation>.test.ts`             |
| `app/services/<entity>/use-<x>.ts`             | `app/services/<entity>/__tests__/use-<x>.test.tsx`           |
| `app/stores/<name>/use-<name>-store.ts`        | `app/stores/<name>/__tests__/use-<name>-store.test.ts`       |
| App-level (App tree, persistence, mocks)       | root `__tests__/<name>.test.tsx`                             |

New test files follow kebab-case like the code. Files in `__tests__` not named `*.test.*` are helpers/fixtures.

---

## Step 2 — Templates

### Pure function

```ts
import { getWorkoutDuration } from '../index'

describe('getWorkoutDuration', () => {
  it('sums exercise and rest time', () => {
    expect(getWorkoutDuration(EXERCISES)).toBe(EXPECTED_SEC)
  })

  it('returns 0 for an empty workout', () => {
    expect(getWorkoutDuration([])).toBe(0)
  })
})
```

Cover the happy path, edge cases (empty, zero, missing fields) and boundaries.

### Component

```tsx
import { screen, userEvent } from '@testing-library/react-native'

import { renderWithStore } from '../../../../__tests__/utils/render'
import WorkoutCard from '../workout-card'

describe('WorkoutCard', () => {
  it('shows the title', async () => {
    await renderWithStore(<WorkoutCard title='Legs' exercisesCount={5} onPress={jest.fn()} />)

    expect(screen.getByText('Legs')).toBeOnTheScreen()
  })

  it('calls onPress when tapped', async () => {
    const handlePress = jest.fn()
    const user = userEvent.setup()

    await renderWithStore(<WorkoutCard title='Legs' exercisesCount={5} onPress={handlePress} />)
    await user.press(screen.getByRole('button'))

    expect(handlePress).toHaveBeenCalledTimes(1)
  })
})
```

Use plain `render` when the component reads no store.

### Fetcher (`app/api`)

```ts
import { supabase } from '../../../lib/supabase/client'
import { getPlans } from '../get-plans'

jest.mock('../../../lib/supabase/client')

const mockQuery = (result: { data: unknown; error: unknown }) => {
  const builder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue(result),
  }

  jest.mocked(supabase.from).mockReturnValue(builder as never)
}

describe('getPlans', () => {
  it('maps rows to plans', async () => {
    mockQuery({ data: [PLAN_ROW], error: null })

    await expect(getPlans({ userId: USER_ID, page: 0 })).resolves.toEqual([PLAN])
  })

  it('throws on error', async () => {
    mockQuery({ data: null, error: new Error('denied') })

    await expect(getPlans({ userId: USER_ID, page: 0 })).rejects.toThrow('denied')
  })
})
```

### React Query hook (`app/services`)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'

import { getWorkout } from '../../../api/workouts/get-workout'
import useWorkout from '../use-workout'

jest.mock('../../../api/workouts/get-workout')

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useWorkout', () => {
  it('returns the workout', async () => {
    jest.mocked(getWorkout).mockResolvedValue(WORKOUT)

    const { result } = await renderHook(() => useWorkout(WORKOUT.id), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data).toEqual(WORKOUT))
  })

  it('does not fetch without an id', async () => {
    await renderHook(() => useWorkout(undefined), { wrapper: createWrapper() })

    expect(getWorkout).not.toHaveBeenCalled()
  })
})
```

For optimistic mutations also assert the cache before the fetcher resolves, and the rollback when it rejects.

### Zustand store

```ts
import { useWorkoutsUiStore } from '../use-workouts-ui-store'

beforeEach(() => useWorkoutsUiStore.getState().reset())

it('selects a workout', () => {
  useWorkoutsUiStore.getState().selectWorkout(WORKOUT_ID)

  expect(useWorkoutsUiStore.getState().selectedWorkoutId).toBe(WORKOUT_ID)
})
```

---

## Step 3 — Mocks

-   Native modules are mocked globally in `__tests__/setup/` — extend those files instead of re-mocking per test.
-   Module mocks go at the top of the file, outside `describe`. Mock only what's needed.
-   Mock the layer below the unit: components mock hooks, hooks mock fetchers, fetchers mock the Supabase client.
-   AsyncStorage is in-memory; `await AsyncStorage.clear()` in `beforeEach` when a test depends on it.
-   Timers: `jest.useFakeTimers()` for timer/cue logic (see `playbackSchedule.test.ts`).

---

## Step 4 — Fixtures

Reuse test data from existing fixtures/test utils; put new shared objects in a `__tests__/fixtures/` helper file
next to the tests (not named `*.test.*`). Extend by spread. Don't inline large objects.

---

## Querying elements — preferred order

1. `getByRole('button', { name: /save/i })`
2. `getByLabelText(...)` / `getByPlaceholderText(...)` for inputs
3. `getByText(...)`
4. `getByTestId('workouts.add')` — the ids Maestro uses are fine to assert on
5. Never query by style or component internals

---

## Best practices

-   Test behavior, not implementation
-   One logical assertion group per test
-   `userEvent` for interactions (`userEvent.setup()`, then `await user.press/type`)
-   Independent tests; `clearMocks` is on globally — reset store/AsyncStorage state yourself
-   No snapshot tests
-   No commented-out tests

---

## Checklist

-   [ ] File in a `__tests__` folder, named `<name>.test.ts(x)`
-   [ ] `await` on `render`, `renderHook` and user events
-   [ ] Every new util function: a test per code path
-   [ ] Every new component: render + interaction test
-   [ ] Every new fetcher: mapping + error test; every hook: success + gating (+ mutation cache behavior)
-   [ ] Every new store: each action + `reset()`; persisted stores: `migrate` and legacy hand-over
-   [ ] Bug fix → regression test
-   [ ] Semantic queries; no snapshots; mocks at the top

## Running tests

```bash
npx jest app/api/plans/__tests__/get-plans.test.ts   # one file
npm test                                             # all
npm run test:coverage
```

All tests must pass before the task is done. Fix failures — do not skip or comment them out.
