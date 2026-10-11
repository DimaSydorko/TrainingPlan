import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Vibration } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { useAppDispatch, useSettings, useWorkout } from './redux'
import { workoutAC } from '../store/WorkoutReducer/WorkoutAC'
import { AppNavigationType, SelectedExerciseType, SelectedWorkoutType, WorkoutType } from '../Utils/types'
import { SOUND_CUE_DURATION_MS, VIBRATION } from '../Utils/constants'
import { plansAC } from '../store/PlansReducer/PlansAC'
import useTTS from './useTTS'
import { createSoundPlayer, SoundPlayer } from '../services/audio'
import {
  advance,
  buildSegments,
  Clock,
  findSegmentIndex,
  pauseClock,
  remainingMs,
  resetClock,
  resumeClock,
  Segment,
  segmentEndsAt,
} from '../Screens/PlayingScreen/playbackSchedule'

// Foreground tick for the UI. The clock itself is timestamp based (playbackSchedule.ts), so the
// interval only decides how quickly the display and cues react; it never counts time.
const TICK_MS = 250
// Spoken countdown, as before (was the CountdownCircleTimer onUpdate handler in PlayingScreen)
const COUNTDOWN_SAY_AT = [10, 3, 2, 1]

/** Delay between a cue sound and the speech that follows it (durationMs is undefined until loaded) */
export function cueDelayMs(player: SoundPlayer): number {
  return player?.durationMs ?? SOUND_CUE_DURATION_MS
}

type PendingClock = { segmentIndex: number; clock: Clock }

const initialPlaying = {
  idx: 0,
  lap: 1,
  updated: Date.now(),
}
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
  const playSound = useMemo(() => createSoundPlayer(sound?.type, { volume: sound?.volume }), [])

  // Release the native player when the playing screen unmounts
  useEffect(() => () => playSound.release(), [playSound])

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
        if (!!sayName) setTimeout(() => onSay(sayName), cueDelayMs(playSound))
      }

      if (!isLastLap) {
        setPlaying(p => ({ ...p, lap: p.lap + 1, updated: Date.now() }))
      } else {
        if (playingWorkout.exercises.length <= playing.idx + 1 && playing.lap <= exercise.laps) {
          if (isVibration) {
            Vibration.vibrate(VIBRATION.END_WORKOUT, true)
            setTimeout(() => Vibration.cancel(), 1500)
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

  // ------------------------------------------------------------------------------------------
  // Timestamp-based clock (D3). `playing` and `isPlaying` stay the source of truth for *where* the
  // player is; the clock tracks *when* the current segment started, so remaining time is derived
  // from Date.now() and survives the JS thread being suspended (locked screen / background).
  const isTheLastOneComplete = isWaitForSubmit && isTheLastOne
  const segments = useMemo<Segment[]>(() => buildSegments(playingWorkout.exercises), [playingWorkout.exercises])
  const segmentIndex = useMemo(
    () => findSegmentIndex(segments, playing.idx, playing.lap),
    [segments, playing.idx, playing.lap]
  )
  const clockRef = useRef<Clock>(resetClock(0, false, Date.now()))
  // Set right before a transition, so the next segment starts at the exact boundary time
  const pendingClockRef = useRef<PendingClock | null>(null)
  const lastUpdatedRef = useRef<number | null>(null)
  const lastIsPlayingRef = useRef<boolean>(isPlaying)
  // `playing.updated` of the segment whose completion was already handled
  const completedUpdatedRef = useRef<number | null>(null)
  const lastSecRef = useRef<number | null>(null)
  const [remainingSec, setRemainingSec] = useState<number>(exercise?.breakTimeInSec || 0)
  // Bumped whenever the clock changes (reset, pause, resume, resync): consumers reschedule cues
  const [clockVersion, setClockVersion] = useState(0)
  // Remounts the countdown circle at the right position after a resync or a mid-segment start
  const [timerSync, setTimerSync] = useState<{ updated: number; key: number; initialRemainingSec?: number }>({
    updated: playing.updated,
    key: 0,
  })
  // The workout finished while the app was in the background: don't replay the finish cues
  const [isCompletedSilently, setIsCompletedSilently] = useState(false)
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active')

  const syncDisplay = (now: number, remountTimer: boolean) => {
    const clock = clockRef.current
    const rem = remainingMs(segments, clock, now)
    const sec = Math.ceil(rem / 1000)
    lastSecRef.current = sec
    setRemainingSec(sec)
    setClockVersion(v => v + 1)
    const segment = segments[clock.segmentIndex]
    if (remountTimer || (segment && segment.durationMs - rem > 300)) {
      setTimerSync(p => ({ updated: playing.updated, key: p.key + 1, initialRemainingSec: rem / 1000 }))
    }
  }

  // Segment changes (skip, previous, reload, auto-advance) and play/pause
  useEffect(() => {
    const now = Date.now()
    if (lastUpdatedRef.current !== playing.updated) {
      lastUpdatedRef.current = playing.updated
      const pending = pendingClockRef.current
      pendingClockRef.current = null
      completedUpdatedRef.current = null
      if (pending && pending.segmentIndex === segmentIndex) {
        // A running pending clock with the player now paused means a manual-start segment
        clockRef.current =
          pending.clock.startedAt !== null && !isPlaying ? resetClock(segmentIndex, false, now) : pending.clock
      } else {
        clockRef.current = resetClock(segmentIndex, isPlaying, now)
      }
    } else if (lastIsPlayingRef.current !== isPlaying) {
      if (!isTheLastOneComplete) {
        clockRef.current = isPlaying ? resumeClock(clockRef.current, now) : pauseClock(clockRef.current, now)
      }
    } else if (clockRef.current.segmentIndex !== segmentIndex) {
      clockRef.current = { ...clockRef.current, segmentIndex }
    } else {
      return
    }
    lastIsPlayingRef.current = isPlaying
    syncDisplay(now, false)
  }, [playing.updated, isPlaying, segmentIndex])

  const tick = () => {
    const now = Date.now()
    const clock = clockRef.current
    const rem = remainingMs(segments, clock, now)
    const sec = Math.ceil(rem / 1000)
    if (sec !== lastSecRef.current) {
      lastSecRef.current = sec
      setRemainingSec(sec)
      if (COUNTDOWN_SAY_AT.includes(sec) && exercise.breakTimeInSec > sec) onSay(`${sec}`)
    }
    if (rem <= 0 && clock.startedAt !== null && completedUpdatedRef.current !== playing.updated) {
      completedUpdatedRef.current = playing.updated
      const end = segmentEndsAt(segments, clock) ?? now
      const next = segments[clock.segmentIndex + 1]
      pendingClockRef.current = next ? { segmentIndex: next.index, clock: resetClock(next.index, true, now, end) } : null
      onTimerComplete()
    }
  }
  const tickRef = useRef(tick)
  tickRef.current = tick

  // Foreground-only UI tick
  useEffect(() => {
    if (!isPlaying || !isAppActive || isTheLastOneComplete) return
    tickRef.current()
    const interval = setInterval(() => tickRef.current(), TICK_MS)
    return () => clearInterval(interval)
  }, [isPlaying, isAppActive, isTheLastOneComplete])

  // Back from background: jump to where the workout should be now, without replaying missed cues
  const resync = () => {
    const now = Date.now()
    if (isTheLastOneComplete) return
    const result = advance(segments, clockRef.current, now)
    if (!result.crossed.length) {
      syncDisplay(now, true)
      return
    }
    const target = segments[result.clock.segmentIndex]
    // Record what the user entered for the approach that was running when the app went away
    onApproachUpdate()
    if (result.finished) {
      setIsCompletedSilently(true)
      setIsWaitForSubmit(true)
    } else {
      setIsPlaying(result.clock.startedAt !== null)
    }
    if (target.idx !== playing.idx || target.lap !== playing.lap) {
      pendingClockRef.current = { segmentIndex: target.index, clock: result.clock }
      if (target.idx !== playing.idx) setExercise(playingWorkout.exercises[target.idx])
      setPlaying({ idx: target.idx, lap: target.lap, updated: now })
    } else {
      clockRef.current = result.clock
      syncDisplay(now, true)
    }
  }
  const resyncRef = useRef(resync)
  resyncRef.current = resync

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      const active = state === 'active'
      setIsAppActive(active)
      if (active) resyncRef.current()
    })
    return () => subscription.remove()
  }, [])

  /** Current schedule snapshot, for scheduling background cue notifications */
  const getSchedule = useCallback(() => ({ segments, clock: clockRef.current }), [segments])

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
    // Timestamp clock (A4)
    remainingSec,
    clockVersion,
    timerSync,
    isCompletedSilently,
    getSchedule,
  }
}
