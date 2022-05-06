import { useCallback, useEffect, useMemo, useState } from 'react'
import { Vibration } from 'react-native'
import { useAppDispatch, useWorkout } from './redux'
import { togglePlaying, updateSelectedWorkout } from '../store/WorkoutReducer/WorkoutSlice'
import { workoutActionCreators } from '../store/WorkoutReducer/WorkoutActionCreators'
import { SelectedWorkoutType, WorkoutType } from '../Utils/types'
import { settings } from '../Utils/constants'

const initialPlaying = {
  idx: 0,
  lap: 1,
  updated: Date.now()
}
type PlayingType = typeof initialPlaying

const initialCurrent = {
  weight: 0,
  repeats: 0
}
type CurrentType = typeof initialCurrent

export default function usePlaying() {
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const [playing, setPlaying] = useState<PlayingType>(initialPlaying)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isWaitForSubmit, setIsWaitForSubmit] = useState(false)
  const [current, setCurrent] = useState<CurrentType>(initialCurrent)
  const exercise = useMemo(() => selectedWorkout.exercises[playing.idx], [playing.idx, selectedWorkout.exercises])
  const exerciseNext = useMemo(
    () => selectedWorkout.exercises[playing.idx + 1],
    [playing.idx, selectedWorkout.exercises]
  )
  const approach = useMemo(() => exercise.approaches[playing.lap - 1], [exercise.approaches, playing.lap])
  const isTheLastOne = useMemo(
    () => selectedWorkout.exercises.length === playing.idx + 1 && exercise.approaches.length === playing.lap,
    [exercise.approaches.length, playing, selectedWorkout.exercises.length]
  )

  useEffect(() => {
    setCurrent({
      repeats: approach?.currentRepeats || approach?.repeats,
      weight: approach?.currentWeight || approach?.weight
    })
  }, [approach])

  const onBack = useCallback(() => {
    dispatch(togglePlaying(false))
  }, [])

  const onApproachUpdate = useCallback(() => {
    const newWorkout: SelectedWorkoutType = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map(ex =>
        ex.uid === exercise.uid
          ? {
              ...ex,
              approaches: ex.approaches.map((ap, idx) =>
                idx + 1 === playing.lap
                  ? {
                      ...ap,
                      currentRepeats: current.repeats,
                      currentWeight: current.weight
                    }
                  : ap
              )
            }
          : ex
      )
    }
    dispatch(updateSelectedWorkout(newWorkout))
  }, [selectedWorkout, exercise.uid, playing.lap, current])

  const onWorkoutSaveResult = useCallback(() => {
    const { isPlaying, ...workout } = selectedWorkout
    const newWorkout: WorkoutType = {
      ...workout,
      exercises: selectedWorkout.exercises.map(ex => ({
        ...ex,
        approaches: ex.approaches.map(ap => ({ weight: ap.currentWeight, repeats: ap.currentRepeats }))
      }))
    }
    dispatch(workoutActionCreators.updateWorkout(newWorkout))
    onBack()
  }, [selectedWorkout])

  const onSaveResult = useCallback(() => {
    onApproachUpdate()
    setTimeout(onWorkoutSaveResult, 100)
  }, [onApproachUpdate, onWorkoutSaveResult])

  const onNext = useCallback(() => {
    settings.isVibration && Vibration.vibrate(100)
    onApproachUpdate()
    if (playing.lap < exercise.laps) {
      setPlaying(p => ({ ...p, lap: p.lap + 1, updated: Date.now() }))
    } else {
      if (selectedWorkout.exercises.length <= playing.idx + 1 && playing.lap <= exercise.laps) {
        settings.isVibration && Vibration.vibrate(1000)
        setIsWaitForSubmit(true)
      } else {
        setPlaying(p => ({ idx: p.idx + 1, lap: 1, updated: Date.now() }))
      }
    }
  }, [exercise.laps, playing, selectedWorkout, onApproachUpdate, onBack])

  const onPrevious = useCallback(() => {
    settings.isVibration && Vibration.vibrate(100)
    onApproachUpdate()
    if (isWaitForSubmit) setIsWaitForSubmit(false)
    if (playing.lap > 1) setPlaying(p => ({ ...p, lap: p.lap - 1, updated: Date.now() }))
    else {
      if (playing.idx <= 0 && playing.lap <= 2) setPlaying({ idx: 0, lap: 1, updated: Date.now() })
      else {
        setPlaying(p => ({ idx: p.idx - 1, lap: selectedWorkout.exercises[playing.idx - 1].laps, updated: Date.now() }))
      }
    }
  }, [playing, isWaitForSubmit, selectedWorkout.exercises])

  const onTimerComplete = useCallback(() => {
    if (!exercise.repeats) onNext()
    else setIsWaitForSubmit(true)
  }, [exercise.repeats, onNext])

  const onTogglePlay = useCallback(() => {
    if (!isWaitForSubmit) setIsPlaying(p => !p)
    else if (isTheLastOne && isWaitForSubmit) return
    else {
      onNext()
      setIsWaitForSubmit(false)
      setIsPlaying(true)
    }
  }, [isWaitForSubmit, selectedWorkout, exercise.uid, playing.lap, current, onNext, isTheLastOne])

  return {
    selectedWorkout,
    isPlaying,
    isWaitForSubmit,
    isTheLastOne,
    playing,
    exercise,
    exerciseNext,
    current,
    approach,
    onNext,
    onBack,
    onPrevious,
    onTogglePlay,
    onTimerComplete,
    onSaveResult,
    setCurrent
  }
}
