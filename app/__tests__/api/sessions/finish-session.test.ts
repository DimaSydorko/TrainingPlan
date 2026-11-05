import { supabase } from '@lib/supabase/client'
import { finishSession } from '@api/sessions/finish-session'
import type { FinishedSession, SetLog } from '@api/sessions/types'

const session: FinishedSession = {
  id: 's1',
  workoutId: 'w1',
  workoutName: 'Push',
  startedAt: '2026-11-05T09:00:00.000Z',
  finishedAt: '2026-11-05T10:00:00.000Z',
}

const set: SetLog = {
  id: 'l1',
  exerciseId: 'ex1',
  workoutExerciseId: 'we1',
  exerciseOrder: 0,
  lapNo: 1,
  plannedReps: 8,
  reps: 6,
  isSkipped: false,
  loggedAt: '2026-11-05T10:00:00.000Z',
}

describe('finishSession', () => {
  it('sends the session and its sets to finish_session and maps the records', async () => {
    jest.mocked(supabase.rpc).mockResolvedValueOnce({
      data: { session_id: 's1', inserted: true, records: [{ exercise_id: 'ex1', kind: 'reps', value: '6' }] },
      error: null,
    } as never)

    await expect(finishSession({ session: { ...session, effortRating: 4 }, sets: [set] })).resolves.toEqual({
      sessionId: 's1',
      isInserted: true,
      records: [{ exerciseId: 'ex1', kind: 'reps', value: 6 }],
    })
    expect(supabase.rpc).toHaveBeenCalledWith('finish_session', {
      p_session: {
        id: 's1',
        workout_id: 'w1',
        plan_id: null,
        workout_name: 'Push',
        source: 'played',
        started_at: session.startedAt,
        finished_at: session.finishedAt,
        effort_rating: 4,
      },
      p_sets: [
        {
          id: 'l1',
          exercise_id: 'ex1',
          workout_exercise_id: 'we1',
          exercise_order: 0,
          lap_no: 1,
          planned_reps: 8,
          planned_weight: null,
          planned_duration_sec: null,
          planned_rest_sec: null,
          reps: 6,
          weight: null,
          duration_sec: null,
          is_skipped: false,
          logged_at: set.loggedAt,
        },
      ],
    })
  })

  it('sends a skipped effort rating as null and throws the Supabase error', async () => {
    const error = new Error('rls')
    jest.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error } as never)

    await expect(finishSession({ session, sets: [] })).rejects.toBe(error)
    expect(supabase.rpc).toHaveBeenCalledWith('finish_session', {
      p_session: expect.objectContaining({ effort_rating: null }),
      p_sets: [],
    })
  })
})
