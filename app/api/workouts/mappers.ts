import type { Json, Tables } from '@lib/supabase/database.types'
import { getExerciseKey, getMetric } from '@api/legacy-import/mappers'
import { EXERCISE_METRIC, MAX_LAPS, MAX_REST_SEC, MIN_LAPS } from '@api/legacy-import/legacy-import.constants'
import { createUuid, isUuid } from '@platform/uuid'
import type { ApproachType, ExerciseType } from '@utils/types'
import type { SaveWorkoutPayload, SetTargetPayload, Workout, WorkoutExercisePayload } from './types'

type ExerciseRow = Pick<Tables<'exercises'>, 'id' | 'name' | 'metric'>

type WorkoutExerciseRow = Pick<
  Tables<'workout_exercises'>,
  'id' | 'position' | 'laps' | 'rest_sec' | 'is_visible' | 'color_idx' | 'sets'
> & { exercises: ExerciseRow | null }

export type WorkoutRow = Pick<
  Tables<'workouts'>,
  'id' | 'owner_id' | 'name' | 'color_idx' | 'labels' | 'updated_at'
> & { workout_exercises: WorkoutExerciseRow[] }

const DEFAULT_REPEATS = 1

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const toSetTargets = (sets: Json): SetTargetPayload[] => (Array.isArray(sets) ? (sets as SetTargetPayload[]) : [])

const toApproaches = (sets: SetTargetPayload[]): ApproachType[] =>
  sets.map(set => ({ repeats: set.reps ?? 0, weight: set.weight ?? 0 }))

const toExercise = (row: WorkoutExerciseRow): ExerciseType => {
  const isTime = row.exercises?.metric === EXERCISE_METRIC.TIME
  const approaches = isTime ? [] : toApproaches(toSetTargets(row.sets))
  const maxRepeats = Math.max(0, ...approaches.map(approach => approach.repeats))

  return {
    uid: row.id,
    ...(row.exercises ? { exerciseId: row.exercises.id } : {}),
    name: row.exercises?.name ?? '',
    laps: row.laps,
    repeats: isTime ? 0 : maxRepeats || DEFAULT_REPEATS,
    approaches,
    isVisible: row.is_visible,
    breakTimeInSec: row.rest_sec,
    colorIdx: row.color_idx,
    imageUrl: '',
  }
}

export const toWorkout = (row: WorkoutRow): Workout => ({
  uid: row.id,
  ownerUid: row.owner_id,
  name: row.name,
  colorIdx: row.color_idx,
  labels: row.labels,
  lastUpdated: new Date(row.updated_at).getTime(),
  exercises: [...row.workout_exercises].sort((a, b) => a.position - b.position).map(toExercise),
})

const toSetPayloads = (exercise: ExerciseType, laps: number): SetTargetPayload[] => {
  const metric = getMetric(exercise)

  return Array.from({ length: laps }, (_, lapIndex) => {
    if (metric === EXERCISE_METRIC.TIME) return { duration_sec: null }
    const approach = exercise.approaches[lapIndex] ?? exercise.approaches[exercise.approaches.length - 1]
    const reps = approach?.repeats || exercise.repeats
    return metric === EXERCISE_METRIC.WEIGHT_REPS ? { reps, weight: approach?.weight ?? 0 } : { reps }
  })
}

const toWorkoutExercisePayload = (exercise: ExerciseType): WorkoutExercisePayload => {
  const laps = clamp(exercise.laps || MIN_LAPS, MIN_LAPS, MAX_LAPS)

  return {
    id: exercise.uid,
    exercise_key: getExerciseKey(exercise),
    exercise_name: exercise.name.trim(),
    exercise_metric: getMetric(exercise),
    laps,
    rest_sec: clamp(exercise.breakTimeInSec || 0, 0, MAX_REST_SEC),
    is_visible: exercise.isVisible,
    color_idx: exercise.colorIdx,
    sets: toSetPayloads(exercise, laps),
  }
}

export const toSaveWorkoutPayload = (workout: Workout, isInLibrary: boolean): SaveWorkoutPayload => ({
  id: workout.uid,
  name: workout.name,
  color_idx: workout.colorIdx,
  labels: workout.labels ?? [],
  in_library: isInLibrary,
  exercises: (workout.exercises ?? []).map(toWorkoutExercisePayload),
})

export const withWorkoutIds = (workout: Workout): Workout => ({
  ...workout,
  uid: isUuid(workout.uid) ? workout.uid : createUuid(),
  exercises: (workout.exercises ?? []).map(exercise =>
    isUuid(exercise.uid) ? exercise : { ...exercise, uid: createUuid() }
  ),
})

export const copyWorkout = (workout: Workout): Workout => ({
  ...workout,
  uid: createUuid(),
  exercises: (workout.exercises ?? []).map(exercise => ({ ...exercise, uid: createUuid() })),
})
