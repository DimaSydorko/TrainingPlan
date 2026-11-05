import * as React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import { registerWorkoutsMutationDefaults } from '@services/workouts/mutation-defaults'
import { workoutsKeys } from '@services/workouts/query-keys'
import useSaveWorkout from '@services/workouts/use-save-workout'
import useDeleteWorkouts from '@services/workouts/use-delete-workouts'
import useReorderWorkouts from '@services/workouts/use-reorder-workouts'
import useWorkout from '@services/workouts/use-workout'
import { WorkoutType } from '@utils/types'

const W1 = '11111111-1111-4111-8111-111111111111'
const W2 = '22222222-2222-4222-8222-222222222222'
const workout = (uid: string, name = uid): WorkoutType => ({ uid, name, colorIdx: 0, labels: [], exercises: [] })

let clients: QueryClient[] = []

afterEach(() => {
  clients.forEach(client => client.clear())
  clients = []
})

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  })
  clients.push(queryClient)
  registerWorkoutsMutationDefaults(queryClient)
  queryClient.setQueryData(workoutsKeys.list('u1'), [workout(W1), workout(W2)])
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const listOf = (queryClient: QueryClient) => queryClient.getQueryData<WorkoutType[]>(workoutsKeys.list('u1'))

describe('workouts mutations', () => {
  it('useSaveWorkout adds a new workout with ids and owner at once and calls save_workout', async () => {
    const { queryClient, wrapper } = setup()
    jest.mocked(supabase.rpc).mockResolvedValue({ data: 'id', error: null } as never)
    const { result } = await renderHook(() => useSaveWorkout(), { wrapper })

    let saved: WorkoutType | undefined
    await act(async () => {
      saved = result.current.saveWorkout('u1', workout('', 'New'))
    })

    expect(saved?.uid).toMatch(/^[0-9a-f-]{36}$/)
    expect(saved?.ownerUid).toBe('u1')
    expect(listOf(queryClient)?.map(item => item.name)).toEqual([W1, W2, 'New'])
    await waitFor(() => expect(supabase.rpc).toHaveBeenCalledWith('save_workout', expect.any(Object)))
  })

  it('useSaveWorkout rolls back when the save fails', async () => {
    const { queryClient, wrapper } = setup()
    jest.mocked(supabase.rpc).mockResolvedValue({ data: null, error: new Error('rls') } as never)
    const { result } = await renderHook(() => useSaveWorkout(), { wrapper })

    await act(async () => {
      result.current.saveWorkout('u1', workout(W1, 'Renamed'))
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(listOf(queryClient)?.[0].name).toBe(W1)
  })

  it('useDeleteWorkouts removes workouts optimistically', async () => {
    const { queryClient, wrapper } = setup()
    const { result } = await renderHook(() => useDeleteWorkouts(), { wrapper })

    await act(async () => {
      result.current.mutate({ userId: 'u1', workoutIds: [W1] })
    })

    expect(listOf(queryClient)?.map(item => item.uid)).toEqual([W2])
  })

  it('useReorderWorkouts reorders optimistically and calls reorder_workouts', async () => {
    const { queryClient, wrapper } = setup()
    jest.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as never)
    const { result } = await renderHook(() => useReorderWorkouts(), { wrapper })

    await act(async () => {
      result.current.mutate({ userId: 'u1', workoutIds: [W2, W1] })
    })

    expect(listOf(queryClient)?.map(item => item.uid)).toEqual([W2, W1])
    await waitFor(() => expect(supabase.rpc).toHaveBeenCalledWith('reorder_workouts', { p_ids: [W2, W1] }))
  })

  it('useWorkout selects one workout from the library list', async () => {
    const { wrapper } = setup()
    const { result } = await renderHook(() => useWorkout({ userId: 'u1', workoutId: W2 }), { wrapper })

    expect(result.current.data?.uid).toBe(W2)
  })
})
