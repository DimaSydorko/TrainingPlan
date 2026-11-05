export type SetLog = {
  id: string
  exerciseId: string
  workoutExerciseId?: string
  exerciseOrder: number
  lapNo: number
  plannedReps?: number
  plannedWeight?: number
  plannedDurationSec?: number
  plannedRestSec?: number
  reps?: number
  weight?: number
  durationSec?: number
  isSkipped: boolean
  loggedAt: string
}

export type FinishedSession = {
  id: string
  workoutId?: string
  planId?: string
  workoutName: string
  startedAt: string
  finishedAt: string
  effortRating?: number
}

export type FinishSessionArgs = { session: FinishedSession; sets: SetLog[] }

export type PersonalRecord = { exerciseId: string; kind: string; value: number }

export type FinishSessionResult = { sessionId: string; isInserted: boolean; records: PersonalRecord[] }
