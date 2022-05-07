import { useCallback, useEffect, useMemo, useState } from 'react'
import { Vibration } from 'react-native'
import { useAppDispatch, useWorkout } from './redux'
import { togglePlaying } from '../store/WorkoutReducer/WorkoutSlice'
import { workoutActionCreators } from '../store/WorkoutReducer/WorkoutActionCreators'
import { SelectedExerciseType, SelectedWorkoutType, WorkoutType } from '../Utils/types'
import { settings } from '../Utils/constants'
import { deepCompare } from '../Utils'

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
  const [playingWorkout, setPlayingWorkout] = useState<SelectedWorkoutType>({
    ...selectedWorkout,
    exercises: selectedWorkout.exercises.filter(ex => ex.isVisible)
  })
  const [exercise, setExercise] = useState<SelectedExerciseType>(playingWorkout.exercises[playing.idx])
  const exerciseNext = useMemo(() => playingWorkout.exercises[playing.idx + 1], [playing.idx, playingWorkout.exercises])
  const approach = useMemo(() => exercise.approaches[playing.lap - 1], [exercise.approaches, playing.lap])
  const isTheLastOne = useMemo(
    () => playingWorkout.exercises.length === playing.idx + 1 && exercise.laps === playing.lap,
    [exercise.laps, playing, playingWorkout.exercises.length]
  )

  //Change Workout when current exercise changed
  useEffect(() => {
    setPlayingWorkout(p => ({
      ...p,
      exercises: p.exercises.map(ex => (ex.uid === exercise.uid ? exercise : ex))
    }))
  }, [exercise])

  useEffect(() => {
    const newExercise = playingWorkout.exercises[playing.idx]
    setExercise(p => (deepCompare(newExercise, p) ? p : newExercise))
  }, [playingWorkout.exercises[playing.idx]])

  useEffect(() => {
    const newCurrent = {
      repeats: approach?.currentRepeats === undefined ? approach?.repeats : approach.currentRepeats,
      weight: approach?.currentWeight === undefined ? approach?.weight : approach.currentWeight
    }
    setCurrent(p => (deepCompare(newCurrent, p) ? p : newCurrent))
  }, [approach])

  const onBack = useCallback(() => {
    dispatch(togglePlaying(false))
  }, [])

  const onWorkoutSaveResult = useCallback(
    (newExercise: SelectedExerciseType) => {
      const { isPlaying, ...workout } = selectedWorkout
      const newWorkout: WorkoutType = {
        ...workout,
        exercises: selectedWorkout.exercises
          .map(ex => (ex.uid === newExercise.uid ? newExercise : ex))
          .map(ex => ({
            ...ex,
            approaches: ex.approaches.map(ap => ({
              weight: ap.currentWeight === undefined ? ap.weight : ap.currentWeight,
              repeats: ap.currentRepeats === undefined ? ap.repeats : ap.currentRepeats
            }))
          }))
      }
      dispatch(workoutActionCreators.updateWorkout(newWorkout))
      onBack()
    },
    [selectedWorkout]
  )

  const onApproachUpdate = useCallback(
    (isSaveData = false) => {
      setExercise(p => {
        const newExercise = {
          ...p,
          approaches: p.approaches.map((ap, idx) =>
            idx + 1 === playing.lap
              ? {
                  ...ap,
                  currentRepeats: current.repeats,
                  currentWeight: current.weight
                }
              : ap
          )
        }
        if (isSaveData) onWorkoutSaveResult(newExercise)
        return newExercise
      })
    },
    [playing.lap, current, onWorkoutSaveResult]
  )

  const onSaveResult = useCallback(() => {
    onApproachUpdate(true)
  }, [onApproachUpdate])

  const onChangeTimer = useCallback(() => {
    onApproachUpdate()
    setIsWaitForSubmit(p => (p ? false : p))
    setIsPlaying(p => (!p ? true : p))
  }, [onApproachUpdate])

  const onNext = useCallback(() => {
    onChangeTimer()
    if (playing.lap < exercise.laps) {
      setPlaying(p => ({ ...p, lap: p.lap + 1, updated: Date.now() }))
    } else {
      if (playingWorkout.exercises.length <= playing.idx + 1 && playing.lap <= exercise.laps) {
        settings.isVibration && Vibration.vibrate(1000)
        setIsWaitForSubmit(true)
      } else {
        setPlaying(p => ({ idx: p.idx + 1, lap: 1, updated: Date.now() }))
      }
    }
  }, [exercise.laps, playing, playingWorkout, onChangeTimer])

  const onPrevious = useCallback(() => {
    onChangeTimer()
    if (playing.lap > 1) setPlaying(p => ({ ...p, lap: p.lap - 1, updated: Date.now() }))
    else {
      if (playing.idx <= 0 && playing.lap <= 2) setPlaying({ idx: 0, lap: 1, updated: Date.now() })
      else {
        setPlaying(p => ({
          idx: p.idx - 1,
          lap: playingWorkout.exercises[playing.idx - 1].laps,
          updated: Date.now()
        }))
      }
    }
  }, [playing, onChangeTimer, playingWorkout.exercises])

  const onTimerComplete = useCallback(() => {
    settings.isVibration && Vibration.vibrate(100)
    if (!exercise.repeats && !isTheLastOne) onNext()
    else setIsWaitForSubmit(true)
  }, [exercise.repeats, onNext, isTheLastOne])

  const onTogglePlay = useCallback(() => {
    if (!isWaitForSubmit) setIsPlaying(p => !p)
    else if (isTheLastOne && isWaitForSubmit) return
    else {
      onNext()
      setIsWaitForSubmit(false)
      setIsPlaying(true)
    }
  }, [isWaitForSubmit, onNext, isTheLastOne])

  const onReload = useCallback(() => {
    setPlaying(p => ({ ...p, updated: Date.now() }))
    setIsPlaying(p => (!p ? true : p))
    setIsWaitForSubmit(p => (p ? false : p))
  }, [])

  return {
    playingWorkout,
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
    onReload,
    setCurrent
  }
}
