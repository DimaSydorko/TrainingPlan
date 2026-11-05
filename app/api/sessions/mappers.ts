import type { Json } from '@lib/supabase/database.types'
import type { FinishedSession, FinishSessionResult, SetLog } from './types'

type FinishSessionRow = {
  session_id: string
  inserted: boolean
  records: { exercise_id: string; kind: string; value: number }[]
}

export const toSessionPayload = (session: FinishedSession) => ({
  id: session.id,
  workout_id: session.workoutId ?? null,
  plan_id: session.planId ?? null,
  workout_name: session.workoutName,
  source: 'played',
  started_at: session.startedAt,
  finished_at: session.finishedAt,
  effort_rating: session.effortRating ?? null,
})

export const toSetPayload = (set: SetLog) => ({
  id: set.id,
  exercise_id: set.exerciseId,
  workout_exercise_id: set.workoutExerciseId ?? null,
  exercise_order: set.exerciseOrder,
  lap_no: set.lapNo,
  planned_reps: set.plannedReps ?? null,
  planned_weight: set.plannedWeight ?? null,
  planned_duration_sec: set.plannedDurationSec ?? null,
  planned_rest_sec: set.plannedRestSec ?? null,
  reps: set.reps ?? null,
  weight: set.weight ?? null,
  duration_sec: set.durationSec ?? null,
  is_skipped: set.isSkipped,
  logged_at: set.loggedAt,
})

export const toFinishSessionResult = (data: Json): FinishSessionResult => {
  const row = data as unknown as FinishSessionRow

  return {
    sessionId: row.session_id,
    isInserted: row.inserted,
    records: (row.records ?? []).map(record => ({
      exerciseId: record.exercise_id,
      kind: record.kind,
      value: Number(record.value),
    })),
  }
}
