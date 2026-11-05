import { SelectedExerciseType } from '@utils/types'
import type { SetLog } from '@services/sessions/types'

const MAX_REPS = 1000
const MAX_WEIGHT = 1000
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type PlaybackPosition = { idx: number; lap: number }

type BuildSetLogsArgs = {
  exercises: SelectedExerciseType[]
  position: PlaybackPosition
  isComplete: boolean
  loggedAt: string
  createId: () => string
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max)

const isLapDone = (exerciseIdx: number, lapNo: number, position: PlaybackPosition, isComplete: boolean) =>
  isComplete || exerciseIdx < position.idx || (exerciseIdx === position.idx && lapNo < position.lap)

const isWeighted = (exercise: SelectedExerciseType) =>
  exercise.approaches.some(approach => approach.weight > 0 || (approach.currentWeight ?? 0) > 0)

const buildExerciseLogs = (
  exercise: SelectedExerciseType,
  exerciseOrder: number,
  { position, isComplete, loggedAt, createId }: Omit<BuildSetLogsArgs, 'exercises'>
): SetLog[] => {
  if (!exercise.exerciseId) return []
  const isTimed = !(exercise.repeats > 0)
  const hasWeight = !isTimed && isWeighted(exercise)

  return Array.from({ length: exercise.laps }, (_, lapIndex) => {
    const lapNo = lapIndex + 1
    const isSkipped = !isLapDone(exerciseOrder, lapNo, position, isComplete)
    const approach = exercise.approaches[lapIndex] ?? exercise.approaches[exercise.approaches.length - 1]
    const plannedReps = approach?.repeats || exercise.repeats
    const plannedWeight = approach?.weight ?? 0
    const base: SetLog = {
      id: createId(),
      exerciseId: exercise.exerciseId!,
      workoutExerciseId: UUID_PATTERN.test(exercise.uid) ? exercise.uid : undefined,
      exerciseOrder,
      lapNo,
      isSkipped,
      loggedAt,
    }

    if (isTimed) {
      return {
        ...base,
        plannedDurationSec: exercise.breakTimeInSec,
        durationSec: isSkipped ? undefined : exercise.breakTimeInSec,
      }
    }

    return {
      ...base,
      plannedReps,
      plannedWeight: hasWeight ? plannedWeight : undefined,
      plannedRestSec: exercise.breakTimeInSec,
      reps: isSkipped ? undefined : Math.round(clamp(approach?.currentRepeats ?? plannedReps, MAX_REPS)),
      weight: isSkipped || !hasWeight ? undefined : clamp(approach?.currentWeight ?? plannedWeight, MAX_WEIGHT),
    }
  })
}

const buildSetLogs = ({ exercises, ...rest }: BuildSetLogsArgs): SetLog[] =>
  exercises.flatMap((exercise, exerciseOrder) => buildExerciseLogs(exercise, exerciseOrder, rest))

export default buildSetLogs
