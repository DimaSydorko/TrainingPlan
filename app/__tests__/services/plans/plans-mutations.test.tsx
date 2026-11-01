import * as React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import { registerPlansMutationDefaults } from '@services/plans/mutation-defaults'
import { plansKeys } from '@services/plans/query-keys'
import useSavePlan from '@services/plans/use-save-plan'
import useSavePlanWorkout from '@services/plans/use-save-plan-workout'
import useDeletePlans from '@services/plans/use-delete-plans'
import useReorderPlans from '@services/plans/use-reorder-plans'
import usePlan from '@services/plans/use-plan'
import { PlanType, WorkoutType } from '@utils/types'

const P1 = '11111111-1111-4111-8111-111111111111'
const P2 = '22222222-2222-4222-8222-222222222222'
const W1 = '33333333-3333-4333-8333-333333333333'
const workout = (name: string): WorkoutType => ({ uid: W1, name, colorIdx: 0, labels: [], exercises: [] })
const plan = (uid: string, name = uid): PlanType => ({
  uid,
  name,
  ownerUid: 'u1',
  colorIdx: 0,
  labels: [],
  lastUpdated: 0,
  workouts: uid === P1 ? [workout('Day 1')] : [],
})

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
  registerPlansMutationDefaults(queryClient)
  queryClient.setQueryData(plansKeys.list('u1'), [plan(P1), plan(P2)])
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const listOf = (queryClient: QueryClient) => queryClient.getQueryData<PlanType[]>(plansKeys.list('u1'))

describe('plans mutations', () => {
  it('useSavePlan adds a new plan at once and calls save_plan', async () => {
    const { queryClient, wrapper } = setup()
    jest.mocked(supabase.rpc).mockResolvedValue({ data: 'id', error: null } as never)
    const { result } = await renderHook(() => useSavePlan(), { wrapper })

    await act(async () => {
      result.current.savePlan('u1', { ...plan('', 'New'), workouts: [] })
    })

    expect(listOf(queryClient)?.map(item => item.name)).toEqual([P1, P2, 'New'])
    await waitFor(() => expect(supabase.rpc).toHaveBeenCalledWith('save_plan', expect.any(Object)))
  })

  it('useSavePlan rolls back when the save fails', async () => {
    const { queryClient, wrapper } = setup()
    jest.mocked(supabase.rpc).mockResolvedValue({ data: null, error: new Error('rls') } as never)
    const { result } = await renderHook(() => useSavePlan(), { wrapper })

    await act(async () => {
      result.current.savePlan('u1', plan(P1, 'Renamed'))
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(listOf(queryClient)?.[0].name).toBe(P1)
  })

  it('useSavePlanWorkout replaces the workout inside its plan and saves it outside the library', async () => {
    const { queryClient, wrapper } = setup()
    jest.mocked(supabase.rpc).mockResolvedValue({ data: W1, error: null } as never)
    const { result } = await renderHook(() => useSavePlanWorkout(), { wrapper })

    await act(async () => {
      result.current.savePlanWorkout('u1', P1, workout('Day 1 v2'))
    })

    expect(listOf(queryClient)?.[0].workouts[0].name).toBe('Day 1 v2')
    await waitFor(() =>
      expect(supabase.rpc).toHaveBeenCalledWith('save_workout', {
        p_workout: expect.objectContaining({ id: W1, in_library: false }),
      })
    )
  })

  it('useDeletePlans and useReorderPlans update the list at once', async () => {
    const { queryClient, wrapper } = setup()
    jest.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as never)
    const { result: reorder } = await renderHook(() => useReorderPlans(), { wrapper })
    const { result: remove } = await renderHook(() => useDeletePlans(), { wrapper })

    await act(async () => {
      reorder.current.mutate({ userId: 'u1', planIds: [P2, P1] })
    })
    expect(listOf(queryClient)?.map(item => item.uid)).toEqual([P2, P1])

    await act(async () => {
      remove.current.mutate({ userId: 'u1', planIds: [P2] })
    })
    expect(listOf(queryClient)?.map(item => item.uid)).toEqual([P1])
  })

  it('usePlan selects one plan from the list', async () => {
    const { wrapper } = setup()
    const { result } = await renderHook(() => usePlan({ userId: 'u1', planId: P2 }), { wrapper })

    expect(result.current.data?.uid).toBe(P2)
  })
})
