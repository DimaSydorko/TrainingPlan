import { supabase } from '@lib/supabase/client'
import { getWorkouts } from '@api/workouts/get-workouts'
import { saveWorkout } from '@api/workouts/save-workout'
import { deleteWorkouts } from '@api/workouts/delete-workouts'
import { reorderWorkouts } from '@api/workouts/reorder-workouts'

const mockQuery = (result: unknown) => {
  const query: Record<string, jest.Mock> & { then?: unknown } = {}
  ;['select', 'eq', 'in', 'order', 'range', 'delete'].forEach(method => {
    query[method] = jest.fn(() => query)
  })
  query.then = (onFulfilled: (value: unknown) => unknown) => Promise.resolve(result).then(onFulfilled)
  jest.mocked(supabase.from).mockReturnValueOnce(query as never)
  return query
}

describe('workouts fetchers', () => {
  it('getWorkouts reads the user library in order', async () => {
    const query = mockQuery({
      data: [
        {
          id: 'w1',
          owner_id: 'u1',
          name: 'A',
          color_idx: 0,
          labels: [],
          updated_at: '2026-01-01T00:00:00Z',
          workout_exercises: [],
        },
      ],
      error: null,
    })

    await expect(getWorkouts('u1')).resolves.toMatchObject([{ uid: 'w1', name: 'A' }])
    expect(supabase.from).toHaveBeenCalledWith('workouts')
    expect(query.eq).toHaveBeenCalledWith('owner_id', 'u1')
    expect(query.eq).toHaveBeenCalledWith('in_library', true)
    expect(query.order).toHaveBeenCalledWith('sort_order')
  })

  it('getWorkouts throws the Supabase error', async () => {
    const error = new Error('denied')
    mockQuery({ data: null, error })

    await expect(getWorkouts('u1')).rejects.toBe(error)
  })

  it('saveWorkout calls save_workout with the payload', async () => {
    jest.mocked(supabase.rpc).mockResolvedValueOnce({ data: 'w1', error: null } as never)

    await expect(
      saveWorkout({ workout: { uid: 'w1', name: 'A', colorIdx: 0, labels: [], exercises: [] } })
    ).resolves.toBe('w1')
    expect(supabase.rpc).toHaveBeenCalledWith('save_workout', {
      p_workout: {
        id: 'w1',
        name: 'A',
        color_idx: 0,
        labels: [],
        in_library: true,
        source_workout_id: null,
        exercises: [],
      },
    })
  })

  it('saveWorkout throws the Supabase error', async () => {
    const error = new Error('rls')
    jest.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error } as never)

    await expect(
      saveWorkout({ workout: { uid: 'w1', name: 'A', colorIdx: 0, labels: [], exercises: [] } })
    ).rejects.toBe(error)
  })

  it('deleteWorkouts deletes the given ids', async () => {
    const query = mockQuery({ error: null })

    await deleteWorkouts(['w1', 'w2'])
    expect(query.delete).toHaveBeenCalled()
    expect(query.in).toHaveBeenCalledWith('id', ['w1', 'w2'])
  })

  it('reorderWorkouts calls reorder_workouts', async () => {
    jest.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error: null } as never)

    await reorderWorkouts(['w2', 'w1'])
    expect(supabase.rpc).toHaveBeenCalledWith('reorder_workouts', { p_ids: ['w2', 'w1'] })
  })
})
