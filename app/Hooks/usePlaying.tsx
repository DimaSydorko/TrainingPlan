import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useWorkout } from './redux'
import { ApproachType, ExerciseType, SelectedWorkoutType } from '../Utils/types'
import { togglePlaying, updateSelectedWorkout } from '../store/WorkoutReducer/WorkoutSlice'
import { settings } from '../Utils/constants'
import { Vibration } from 'react-native'

const initialPlaying = {
  idx: 0,
  lap: 1,
  updated: Date.now()
}
type PlayingType = typeof initialPlaying

interface onApproachUpdateType {
  exerciseUid: string
  lap: number
  currentRepeats: number
  currentWeight: number
}

export default function usePlaying() {
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const [playing, setPlaying] = useState<PlayingType>(initialPlaying)
  const exercise = useMemo(() => selectedWorkout.exercises[playing.idx], [playing.idx])
  const exerciseNext = useMemo(() => selectedWorkout.exercises[playing.idx + 1], [playing.idx])
  const approach = useMemo(() => exercise.approaches[playing.lap - 1], [exercise, playing.lap])
  const [isPlaying, setIsPlaying] = useState(true)
  const [isWaitForSubmit, setIsWaitForSubmit] = useState(false)
  const [currentWeight, setCurrentWeight] = useState<number>(0)
  const [currentRepeats, setCurrentRepeats] = useState<number>(0)

  const onBack = useCallback(() => {
    dispatch(togglePlaying(false))
  }, [])

  const onNext = useCallback(() => {
    settings.isVibration && Vibration.vibrate(100)
    if (playing.lap < exercise.laps) setPlaying(p => ({ ...p, lap: p.lap + 1, updated: Date.now() }))
    else {
      if (selectedWorkout.exercises.length <= playing.idx + 1 && playing.lap <= exercise.laps) {
        settings.isVibration && Vibration.vibrate(1000)
        onBack()
      } else setPlaying(p => ({ idx: p.idx + 1, lap: 1, updated: Date.now() }))
    }
  }, [exercise.laps, playing, selectedWorkout.exercises.length])

  const onPrevious = useCallback(() => {
    settings.isVibration && Vibration.vibrate(100)
    if (playing.lap > 1) setPlaying(p => ({ ...p, lap: p.lap - 1, updated: Date.now() }))
    else {
      if (playing.idx <= 0 && playing.lap <= 2) setPlaying({ idx: 0, lap: 1, updated: Date.now() })
      else {
        setPlaying(p => ({ idx: p.idx - 1, lap: selectedWorkout.exercises[playing.idx - 1].laps, updated: Date.now() }))
      }
    }
  }, [playing, selectedWorkout.exercises])

  const onTimerComplete = useCallback(() => {
    if (!exercise.repeats) onNext()
    else setIsWaitForSubmit(true)
  }, [exercise.repeats])

  const onTogglePlay = useCallback(() => {
    if (!isWaitForSubmit) setIsPlaying(p => !p)
    else {
      onNext()
      onApproachUpdate({ exerciseUid: exercise.uid, lap: playing.lap, currentRepeats, currentWeight })
      setIsPlaying(true)
    }
  }, [isWaitForSubmit, selectedWorkout, exercise.uid, playing.lap, currentRepeats, currentWeight])

  const onApproachUpdate = useCallback(({ exerciseUid, lap, currentRepeats, currentWeight }: onApproachUpdateType) => {
    const newWorkout: SelectedWorkoutType = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map<ExerciseType>(ex =>
        ex.uid === exerciseUid
          ? {
              ...ex,
              approaches: ex.approaches.map<ApproachType>((ap, idx) =>
                idx + 1 === lap
                  ? {
                      ...ap,
                      currentRepeats,
                      currentWeight
                    }
                  : ap
              )
            }
          : ex
      )
    }
    dispatch(updateSelectedWorkout(newWorkout))
  }, [])

  return {
    isPlaying,
    playing,
    exercise,
    exerciseNext,
    approach,
    onNext,
    onBack,
    onPrevious,
    onTogglePlay,
    onTimerComplete,
    setCurrentWeight,
    setCurrentRepeats
  }
}
