import { supabase } from '@lib/supabase/client'
import { toPlan, toSavePlanPayload, withPlanIds, type PlanRow } from '@api/plans/mappers'
import { getPlans } from '@api/plans/get-plans'
import { savePlan } from '@api/plans/save-plan'
import { deletePlans } from '@api/plans/delete-plans'
import { reorderPlans } from '@api/plans/reorder-plans'
import { PlanType } from '@utils/types'

const P_ID = '33333333-3333-4333-8333-333333333333'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const workoutRow = (id: string, name: string) => ({
  id,
  owner_id: 'u1',
  name,
  color_idx: 0,
  labels: [],
  updated_at: '2026-11-01T00:00:00Z',
  source_workout_id: id === 'w2' ? 'lib-1' : null,
  workout_exercises: [],
})

const row: PlanRow = {
  id: P_ID,
  owner_id: 'u1',
  name: 'Split',
  color_idx: 3,
  labels: ['gym'],
  updated_at: '2026-11-01T00:00:00Z',
  plan_workouts: [
    { position: 1, workouts: workoutRow('w2', 'Day 2') },
    { position: 0, workouts: workoutRow('w1', 'Day 1') },
    { position: 2, workouts: null },
  ],
}

const mockQuery = (result: unknown) => {
  const query: Record<string, jest.Mock> & { then?: unknown } = {}
  ;['select', 'eq', 'order', 'range'].forEach(method => {
    query[method] = jest.fn(() => query)
  })
  query.then = (onFulfilled: (value: unknown) => unknown) => Promise.resolve(result).then(onFulfilled)
  jest.mocked(supabase.from).mockReturnValueOnce(query as never)
  return query
}

describe('plans mappers', () => {
  it('maps a plan with its workouts in position order', () => {
    const plan = toPlan(row)

    expect(plan).toMatchObject({ uid: P_ID, name: 'Split', colorIdx: 3, labels: ['gym'] })
    expect(plan.workouts.map(workout => workout.name)).toEqual(['Day 1', 'Day 2'])
    expect(plan.workouts[1].sourceWorkoutId).toBe('lib-1')
  })

  it('builds the save_plan payload with plan workouts outside the library', () => {
    const payload = toSavePlanPayload(toPlan(row))

    expect(payload).toMatchObject({ id: P_ID, name: 'Split', color_idx: 3, labels: ['gym'] })
    expect(payload.workouts.map(workout => [workout.id, workout.in_library, workout.source_workout_id])).toEqual([
      ['w1', false, null],
      ['w2', false, 'lib-1'],
    ])
  })

  it('withPlanIds gives a new plan and its workouts uuids', () => {
    const plan: PlanType = {
      uid: '',
      ownerUid: '',
      name: 'New',
      colorIdx: 0,
      labels: [],
      lastUpdated: 0,
      workouts: [{ uid: 'nano', name: 'W', colorIdx: 0, labels: [], exercises: [] }],
    }
    const prepared = withPlanIds(plan)

    expect(prepared.uid).toMatch(UUID)
    expect(prepared.workouts[0].uid).toMatch(UUID)
    expect(withPlanIds({ ...plan, uid: P_ID }).uid).toBe(P_ID)
  })
})

describe('plans fetchers', () => {
  it('getPlans reads the user plans in order', async () => {
    const query = mockQuery({ data: [row], error: null })

    await expect(getPlans('u1')).resolves.toMatchObject([{ uid: P_ID }])
    expect(supabase.from).toHaveBeenCalledWith('plans')
    expect(query.eq).toHaveBeenCalledWith('owner_id', 'u1')
    expect(query.order).toHaveBeenCalledWith('sort_order')
  })

  it('getPlans throws the Supabase error', async () => {
    const error = new Error('denied')
    mockQuery({ data: null, error })

    await expect(getPlans('u1')).rejects.toBe(error)
  })

  it('savePlan calls save_plan', async () => {
    jest.mocked(supabase.rpc).mockResolvedValueOnce({ data: P_ID, error: null } as never)

    await expect(savePlan(toPlan(row))).resolves.toBe(P_ID)
    expect(supabase.rpc).toHaveBeenCalledWith('save_plan', { p_plan: expect.objectContaining({ id: P_ID }) })
  })

  it('deletePlans calls delete_plan for every plan and stops on an error', async () => {
    const error = new Error('rls')
    jest
      .mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: null, error: null } as never)
      .mockResolvedValueOnce({ data: null, error } as never)

    await expect(deletePlans(['p1', 'p2', 'p3'])).rejects.toBe(error)
    expect(supabase.rpc).toHaveBeenCalledWith('delete_plan', { p_plan_id: 'p1' })
    expect(supabase.rpc).toHaveBeenCalledWith('delete_plan', { p_plan_id: 'p2' })
    expect(supabase.rpc).not.toHaveBeenCalledWith('delete_plan', { p_plan_id: 'p3' })
  })

  it('reorderPlans calls reorder_plans', async () => {
    jest.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error: null } as never)

    await reorderPlans(['p2', 'p1'])
    expect(supabase.rpc).toHaveBeenCalledWith('reorder_plans', { p_ids: ['p2', 'p1'] })
  })
})
