import type { ApproachType, ExerciseType, WorkoutType } from '@utils/types'
import {
  EXERCISE_METRIC,
  type ExerciseMetric,
  FIREBASE_STORAGE_OBJECT_MARKER,
  MAX_LAPS,
  MAX_REST_SEC,
  MIN_LAPS,
  TIME_EXERCISE_KEY_PREFIX,
} from './legacy-import.constants'
import type {
  LegacyExercisePayload,
  LegacyImportPayload,
  LegacySetTarget,
  LegacyWorkoutExercisePayload,
  LegacyWorkoutPayload,
  MapLegacyDataArgs,
} from './types'

export function mapLegacyDataToPayload({
  workouts,
  plans,
  catalogExerciseIds = {},
  isBaselineIncluded = true,
}: MapLegacyDataArgs): LegacyImportPayload {
  const allWorkouts = [...workouts, ...plans.flatMap(plan => plan.workouts)]
  const exercises = collectExercises(allWorkouts, catalogExerciseIds)
  const metricByKey = new Map(exercises.map(exercise => [exercise.key, exercise.metric]))
  const libraryWorkouts = workouts.map(workout => mapWorkout(workout, metricByKey))

  return {
    exercises,
    workouts: libraryWorkouts,
    plans: plans.map(plan => ({
      legacy_id: plan.uid,
      name: plan.name,
      color_idx: plan.colorIdx,
      labels: plan.labels ?? [],
      updated_at_ms: plan.lastUpdated,
      workouts: plan.workouts.map(workout => {
        const planWorkout = mapWorkout(workout, metricByKey)

        return { ...planWorkout, source_legacy_id: findSourceWorkoutId(planWorkout, libraryWorkouts) }
      }),
    })),
    include_baseline: isBaselineIncluded,
  }
}

export function getExerciseKey(exercise: ExerciseType): string {
  const normalizedName = normalizeExerciseName(exercise.name)

  return isTimeExercise(exercise) ? `${TIME_EXERCISE_KEY_PREFIX}${normalizedName}` : normalizedName
}

export function getImageFileName(imageUrl: string): string | undefined {
  if (!imageUrl) return undefined
  const [path] = imageUrl.split('?')
  const objectPath = path.includes(FIREBASE_STORAGE_OBJECT_MARKER)
    ? path.split(FIREBASE_STORAGE_OBJECT_MARKER).pop()
    : path
  const fileName = safeDecode(objectPath ?? '')
    .split('/')
    .pop()

  return fileName || undefined
}

function normalizeExerciseName(name: string): string {
  return name.replace(/_/g, ' ').trim().replace(/\s+/g, ' ').toLowerCase()
}

function isTimeExercise(exercise: ExerciseType): boolean {
  return !(exercise.repeats > 0)
}

function hasWeight(exercise: ExerciseType): boolean {
  return exercise.approaches.some(approach => approach.weight > 0)
}

function collectExercises(
  workouts: WorkoutType[],
  catalogExerciseIds: Record<string, string>
): LegacyExercisePayload[] {
  const byKey = new Map<string, LegacyExercisePayload>()

  workouts
    .flatMap(workout => workout.exercises)
    .forEach(exercise => {
      const key = getExerciseKey(exercise)
      const existing = byKey.get(key)
      const metric = getMetric(exercise, existing?.metric)

      byKey.set(key, {
        key,
        name: existing?.name ?? exercise.name.trim(),
        metric,
        image_file_name: existing?.image_file_name ?? getImageFileName(exercise.imageUrl),
        catalog_exercise_id: catalogExerciseIds[key],
      })
    })

  return [...byKey.values()]
}

export function getMetric(exercise: ExerciseType, previousMetric?: ExerciseMetric): ExerciseMetric {
  if (isTimeExercise(exercise)) return EXERCISE_METRIC.TIME
  if (previousMetric === EXERCISE_METRIC.WEIGHT_REPS || hasWeight(exercise)) return EXERCISE_METRIC.WEIGHT_REPS

  return EXERCISE_METRIC.REPS
}

function mapWorkout(workout: WorkoutType, metricByKey: Map<string, ExerciseMetric>): LegacyWorkoutPayload {
  return {
    legacy_id: workout.uid,
    name: workout.name,
    color_idx: workout.colorIdx,
    labels: workout.labels ?? [],
    updated_at_ms: workout.lastUpdated,
    exercises: workout.exercises.map(exercise => mapWorkoutExercise(exercise, metricByKey)),
  }
}

function mapWorkoutExercise(
  exercise: ExerciseType,
  metricByKey: Map<string, ExerciseMetric>
): LegacyWorkoutExercisePayload {
  const key = getExerciseKey(exercise)
  const laps = clamp(exercise.laps || MIN_LAPS, MIN_LAPS, MAX_LAPS)

  return {
    exercise_key: key,
    laps,
    rest_sec: clamp(exercise.breakTimeInSec || 0, 0, MAX_REST_SEC),
    is_visible: exercise.isVisible,
    color_idx: exercise.colorIdx,
    sets: mapSets(exercise, laps, metricByKey.get(key) ?? EXERCISE_METRIC.REPS),
  }
}

function mapSets(exercise: ExerciseType, laps: number, metric: ExerciseMetric): LegacySetTarget[] {
  const lapIndexes = Array.from({ length: laps }, (_, index) => index)

  if (metric === EXERCISE_METRIC.TIME) return lapIndexes.map(() => ({ duration_sec: null }))

  return lapIndexes.map(index => {
    const approach = getApproachForLap(exercise, index)

    return metric === EXERCISE_METRIC.WEIGHT_REPS
      ? { reps: approach.repeats, weight: approach.weight }
      : { reps: approach.repeats }
  })
}

function getApproachForLap(exercise: ExerciseType, lapIndex: number): ApproachType {
  const { approaches } = exercise

  return approaches[lapIndex] ?? approaches[approaches.length - 1] ?? { repeats: exercise.repeats, weight: 0 }
}

function findSourceWorkoutId(
  planWorkout: LegacyWorkoutPayload,
  libraryWorkouts: LegacyWorkoutPayload[]
): string | undefined {
  const exerciseKeys = planWorkout.exercises.map(exercise => exercise.exercise_key).join('|')

  return libraryWorkouts.find(
    workout =>
      workout.name.trim() === planWorkout.name.trim() &&
      workout.exercises.map(exercise => exercise.exercise_key).join('|') === exerciseKeys
  )?.legacy_id
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
