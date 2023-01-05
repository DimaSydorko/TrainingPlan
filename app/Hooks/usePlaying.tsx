import { useCallback, useEffect, useMemo, useState } from 'react'
import { Vibration } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { useAppDispatch, useSettings, useWorkout } from './redux'
import { workoutAC } from '../store/WorkoutReducer/WorkoutAC'
import { AppNavigationType, SelectedExerciseType, SelectedWorkoutType, WorkoutType } from '../Utils/types'
import { VIBRATION } from '../Utils/constants'
import { plansAC } from '../store/PlansReducer/PlansAC'
import useTTS from './useTTS'

const Sound = require('react-native-sound')

const initialPlaying = {
  idx: 0,
  lap: 1,
  updated: Date.now(),
}
Sound.setCategory('Playback', true)
type PlayingType = typeof initialPlaying

export default function usePlaying() {
  const dispatch = useAppDispatch()
  const onSay = useTTS()
  const { selectedWorkout } = useWorkout()
  const navigation = useNavigation<AppNavigationType>()
  const { isVibration, sound } = useSettings()
  const [playing, setPlaying] = useState<PlayingType>(initialPlaying)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWaitForSubmit, setIsWaitForSubmit] = useState(false)
  const [currentWeight, setCurrentWeight] = useState<number>(0)
  const [currentRepeats, setCurrentRepeats] = useState<number>(0)
  const [playingWorkout, setPlayingWorkout] = useState<SelectedWorkoutType>({
    ...selectedWorkout,
    exercises: selectedWorkout?.exercises?.filter(ex => ex.isVisible),
  })
  const [exercise, setExercise] = useState<SelectedExerciseType>(playingWorkout.exercises[playing.idx])
  const exerciseNext = useMemo(() => playingWorkout.exercises[playing.idx + 1], [playing.idx, playingWorkout.exercises])
  const exercisePrev = useMemo(() => playingWorkout.exercises[playing.idx - 1], [playing.idx, playingWorkout.exercises])
  const approach = useMemo(() => exercise.approaches[playing.lap - 1], [exercise.approaches, playing.lap])
  const isTheLastOne = useMemo(
    () => playingWorkout.exercises.length === playing.idx + 1 && exercise.laps === playing.lap,
    [exercise.laps, playing, playingWorkout.exercises.length]
  )
  const playSound = useMemo(() => new Sound(sound?.type, Sound.MAIN_BUNDLE), [])

  useEffect(() => {
    playSound.setVolume(sound?.volume)
  }, [playSound])

  useEffect(() => {
    const weight = approach?.currentWeight === undefined ? approach?.weight : approach.currentWeight
    const repeats = approach?.currentRepeats === undefined ? approach?.repeats : approach.currentRepeats
    setCurrentWeight(weight)
    setCurrentRepeats(repeats)
  }, [approach])

  const onBack = useCallback(() => navigation.goBack(), [])
  const onChangePlayingWorkout = useCallback(
    _exercise => {
      setPlayingWorkout(p => {
        return {
          ...p,
          exercises: p.exercises.map(ex => (ex.uid === _exercise.uid ? _exercise : ex)),
        }
      })
    },
    [setPlayingWorkout]
  )

  const onWorkoutSaveResult = useCallback(
    (newExercise: SelectedExerciseType) => {
      const newWorkout: WorkoutType = {
        ...selectedWorkout,
        exercises: selectedWorkout?.exercises
          .map(ex => (ex.isVisible ? playingWorkout.exercises.find(pEx => pEx.uid === ex.uid) : ex))
          .map(ex => (ex.uid === newExercise.uid ? newExercise : ex))
          .map(ex => ({
            ...ex,
            approaches: ex.approaches.map(ap => ({
              weight: ap.currentWeight === undefined ? ap.weight : ap.currentWeight,
              repeats: ap.currentRepeats === undefined ? ap.repeats : ap.currentRepeats,
            })),
          })),
      }
      if (!!newWorkout?.ownerUid) dispatch(workoutAC.updateWorkout(newWorkout))
      else dispatch(plansAC.updateSelectedPlanWorkout(newWorkout))
    },
    [selectedWorkout, playingWorkout]
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
                  currentRepeats,
                  currentWeight,
                }
              : ap
          ),
        }
        if (isSaveData) onWorkoutSaveResult(newExercise)
        onChangePlayingWorkout(newExercise)
        return newExercise
      })
    },
    [playing.lap, currentRepeats, currentWeight, onWorkoutSaveResult, onChangePlayingWorkout]
  )

  const onSaveResult = useCallback(() => {
    onApproachUpdate(true)
  }, [onApproachUpdate])

  const onChangeTimer = useCallback(
    (isPrev = false) => {
      onApproachUpdate()
      const isLastLap = playing.lap >= exercise.laps
      if ((!isLastLap && exercise.repeats) || (isLastLap && exerciseNext?.repeats) || isPrev) {
        setIsPlaying(p => (p ? false : p))
      }
      setIsWaitForSubmit(p => (p ? false : p))
    },
    [onApproachUpdate, exercise, exerciseNext?.repeats, playing.lap, exercisePrev?.repeats]
  )

  const onNext = useCallback(
    (isSkip = true) => {
      onChangeTimer()
      const isLastLap = playing.lap >= exercise.laps
      const sayName = isLastLap ? exerciseNext?.name : exercise.name

      if (isSkip) {
        if (!!sayName) onSay(sayName)
      } else {
        playSound.play()
        if (!!sayName) setTimeout(() => onSay(sayName), playSound.getDuration() * 1000)
      }

      if (!isLastLap) {
        setPlaying(p => ({ ...p, lap: p.lap + 1, updated: Date.now() }))
      } else {
        if (playingWorkout.exercises.length <= playing.idx + 1 && playing.lap <= exercise.laps) {
          if (isVibration) {
            Vibration.vibrate(VIBRATION.END_WORKOUT, true)
            setTimeout(() => Vibration.cancel(), 3000)
          }
          setIsWaitForSubmit(true)
        } else {
          setPlaying(p => {
            setExercise(playingWorkout.exercises[p.idx + 1])
            return { idx: p.idx + 1, lap: 1, updated: Date.now() }
          })
        }
      }
    },
    [exercise.laps, playing, playingWorkout.exercises.length, onChangeTimer, exerciseNext?.name]
  )

  const onPrevious = useCallback(() => {
    onChangeTimer(true)
    const isFirstLap = playing.lap <= 1
    const sayName = isFirstLap ? exercisePrev?.name : exercise.name
    if (!!sayName) onSay(sayName)

    if (!isFirstLap)
      setPlaying(p => {
        setExercise(playingWorkout.exercises[p.idx])
        return { ...p, lap: p.lap - 1, updated: Date.now() }
      })
    else {
      if (playing.idx <= 0 && playing.lap <= 2) {
        setPlaying({ idx: 0, lap: 1, updated: Date.now() })
        setExercise(playingWorkout.exercises[0])
      } else {
        setPlaying(p => {
          setExercise(playingWorkout.exercises[p.idx - 1])
          return {
            idx: p.idx - 1,
            lap: playingWorkout.exercises[playing.idx - 1].laps,
            updated: Date.now(),
          }
        })
      }
    }
  }, [playing, onChangeTimer, playingWorkout.exercises, exercisePrev?.name])

  const onTimerComplete = useCallback(() => {
    if (isVibration) {
      Vibration.vibrate(VIBRATION.END_EXERCISE, true)
      setTimeout(() => Vibration.cancel(), 1900)
    }
    onNext(false)
  }, [onNext])

  const onTogglePlay = useCallback(() => {
    if (isVibration) Vibration.vibrate(VIBRATION.TIMER)
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
    currentRepeats,
    currentWeight,
    approach,
    playSound,
    onNext,
    onBack,
    onPrevious,
    onTogglePlay,
    onTimerComplete,
    onSaveResult,
    onReload,
    setCurrentRepeats,
    setCurrentWeight,
  }
}
