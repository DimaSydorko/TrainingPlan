import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { LayoutAnimation, TouchableOpacity, View } from 'react-native'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { useNavigation } from '@react-navigation/native'
import { activateKeepAwake, deactivateKeepAwake } from '@platform/keep-awake'

import usePlaying, { cueDelayMs } from '@hooks/use-playing'
import { useScreen } from '@platform/screen'
import useTTS from '@hooks/use-tts'
import { useAppTheme } from '@theme/use-app-theme'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { getWorkoutDuration } from '@utils'
import { AppNavigationType } from '@utils/types'
import { AppImage, ConfirmButton, GoBackSubmitModal, IconButton } from '@common'
import { secondsToMinSec } from '@components/workout-duration/workout-duration'
import { FlexCenterColumn, FlexSpaceBetween, TextHeader, TextSecondary } from '@theme/parents'
import { getExerciseColor } from '@theme/tokens'
import { theme } from '@theme/theme'
import { icon } from '@theme/icons'
import { useAppInsets } from '@theme/insets'

import PlayingReview from './playing-review/playing-review'
import Results from './components/results'
import TimeObserver from './components/time-observer'
import PlayHeader from './components/play-header'
import styles from './styles'
import useBackgroundCues from './use-background-cues'
import { PLAYING_GUTTER } from './playing-screen.constants'

export default memo(function PlayingScreen() {
  const { colors, isDark } = useAppTheme()
  const workout = useSettingsStore(state => state.workout)
  const isSaveBatteryMode = useSettingsStore(state => state.isSaveBatteryMode)
  const sound = useSettingsStore(state => state.sound)
  const isVibration = useSettingsStore(state => state.isVibration)
  const onSay = useTTS()
  const navigation = useNavigation<AppNavigationType>()
  // Edge-to-edge: keep the header below the status bar and the controls above the navigation bar
  const { top, bottom, footer } = useAppInsets()
  const { width } = useScreen()
  const timerContentMaxSize = width - PLAYING_GUTTER.TIMER_CONTENT
  const {
    isPlaying,
    isWaitForSubmit,
    isTheLastOne,
    playing,
    exercise,
    currentRepeats,
    currentWeight,
    approach,
    playSound,
    exerciseNext,
    onTogglePlay,
    onNext,
    onSaveResult,
    onPrevious,
    setCurrentRepeats,
    setCurrentWeight,
    onReload,
    playingWorkout,
    remainingSec,
    clockVersion,
    timerSync,
    isCompletedSilently,
    getSchedule,
  } = usePlaying()
  const [isWorkoutReview, setIsWorkoutReview] = useState<boolean>(false)
  const [isSubmitGoBack, setIsSubmitGoBack] = useState<boolean>(false)
  const [isInvisibleTimerCircle, setIsInvisibleTimerCircle] = useState<boolean>(false)
  const color = getExerciseColor(exercise?.colorIdx || 0, isDark)
  const isTheLastOneComplete = isWaitForSubmit && isTheLastOne

  const weightDiff = currentWeight - approach?.weight || 0
  const repeatsDiff = currentRepeats - approach?.repeats || 0

  const duration = isTheLastOneComplete ? 0 : exercise.breakTimeInSec
  const workoutDurationTime =
    getWorkoutDuration(playingWorkout.exercises.filter((ex, idx) => idx > playing.idx)) +
    (exercise.laps - playing.lap) * duration
  const displayRemainingSec = isTheLastOneComplete ? 0 : Math.max(0, remainingSec)
  // The circle animates by itself; it is remounted at the clock's position after a resync
  const isTimerSynced = timerSync.updated === playing.updated
  const timerKey = `${playing.lap}_${playing.idx}_${playing.updated}_${isTimerSynced ? timerSync.key : 0}`

  useBackgroundCues({
    getSchedule,
    clockVersion,
    isPlaying,
    isComplete: isTheLastOneComplete,
    showSession: !isSaveBatteryMode,
    workoutName: playingWorkout.name,
    description: `${exercise.name}:  ${playing.lap}/${exercise.laps}`,
    color,
    sound: sound?.type,
    isVibration,
  })

  useEffect(() => {
    if (isPlaying) setIsInvisibleTimerCircle(p => (p ? !p : p))
    const interval = setInterval(() => {
      if (isPlaying) return
      setIsInvisibleTimerCircle(p => !p)
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [isPlaying])

  useEffect(() => {
    if (!isSaveBatteryMode) activateKeepAwake()
    return () => !isSaveBatteryMode && deactivateKeepAwake()
  }, [])

  useEffect(() => {
    onSay(exercise.name)
  }, [])

  useEffect(() => {
    if (isSubmitGoBack) navigation.goBack()
  }, [isSubmitGoBack])

  useEffect(() => {
    if (isTheLastOneComplete) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setIsWorkoutReview(p => (p ? p : true))
      // Finished while in the background: the finish was already announced by a notification
      if (isCompletedSilently) return
      playSound.play()
      setTimeout(() => onSay('Workout complete'), cueDelayMs(playSound))
    }
  }, [isTheLastOneComplete])

  const onGoBack = useCallback(() => {
    setIsSubmitGoBack(true)
  }, [])

  const _onSaveResult = useCallback(() => {
    setTimeout(() => onSaveResult(), 100)
    setIsSubmitGoBack(true)
  }, [onSaveResult])

  const toggleWorkoutReview = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsWorkoutReview(p => !p)
  }, [setIsWorkoutReview])

  return (
    <View
      testID='playing.screen'
      style={[theme.containers.centerColumn, styles.page, { backgroundColor: colors.background, paddingTop: top }]}
    >
      <PlayHeader
        isPlaying={isPlaying}
        playingLap={playing.lap}
        exerciseLaps={exercise.laps}
        workoutDurationTime={workoutDurationTime}
      />

      <FlexCenterColumn>
        <View style={styles.nextExercise}>
          {!isTheLastOneComplete && (
            <>
              <TextSecondary center>Next up</TextSecondary>
              {!!exerciseNext ? (
                <>
                  <TextSecondary center color={getExerciseColor(exerciseNext?.colorIdx || 0, isDark)}>
                    {exerciseNext.name}
                  </TextSecondary>
                  <TextSecondary center>
                    Laps {exerciseNext.laps}
                    {!!exerciseNext.approaches[0]?.weight && `    Weight ${exerciseNext.approaches[0]?.weight} kg`}
                  </TextSecondary>
                </>
              ) : (
                <TextSecondary center color={colors.accent}>
                  Finish
                </TextSecondary>
              )}
            </>
          )}
        </View>

        <TouchableOpacity testID='playing.timer' style={styles.timerContainer} onPress={onTogglePlay}>
          <CountdownCircleTimer
            key={timerKey}
            isPlaying={isPlaying && !isTheLastOneComplete}
            duration={duration}
            initialRemainingTime={
              isTimerSynced && timerSync.initialRemainingSec !== undefined && !isTheLastOneComplete
                ? Math.min(duration, timerSync.initialRemainingSec)
                : undefined
            }
            colors={isInvisibleTimerCircle ? new Array(3).fill('#00000000') : (color as any)}
            colorsTime={[exercise.breakTimeInSec, exercise.breakTimeInSec / 2, 0]}
            strokeWidth={14}
            trailColor={colors.surfaceElevated as any}
            // Segment completion and the spoken countdown are driven by the timestamp clock in usePlaying
            size={width - PLAYING_GUTTER.TIMER}
          >
            {() => (
              <FlexCenterColumn
                style={[styles.timerContent, { maxWidth: timerContentMaxSize, maxHeight: timerContentMaxSize }]}
              >
                {!!exercise.imageUrl && <AppImage size={100} src={exercise.imageUrl} />}
                <TextHeader center color={color} style={{ fontSize: 24 }} ellipsizeMode='tail' numberOfLines={2}>
                  {exercise.name}
                </TextHeader>
                <TextHeader color={colors.textPrimary} style={{ fontSize: 22 }}>
                  {secondsToMinSec(displayRemainingSec, false)}
                </TextHeader>
                <TimeObserver time={displayRemainingSec} />
              </FlexCenterColumn>
            )}
          </CountdownCircleTimer>
        </TouchableOpacity>

        {!!exercise.repeats && (
          <View style={{ width: width - PLAYING_GUTTER.RESULTS }}>
            <Results
              type={'weight'}
              step={workout.weightStep}
              color={color}
              value={currentWeight}
              onChange={setCurrentWeight}
              diff={weightDiff}
            />
            <Results
              type={'repeats'}
              color={color}
              value={currentRepeats}
              repeats={exercise.repeats}
              onChange={setCurrentRepeats}
              diff={repeatsDiff}
            />
          </View>
        )}
        {isTheLastOneComplete && (
          <ConfirmButton
            header={'Save Result'}
            style={{ width: width - PLAYING_GUTTER.SAVE_BUTTON }}
            onPress={onSaveResult}
            testID='playing.saveResult'
          />
        )}
      </FlexCenterColumn>

      <FlexSpaceBetween
        style={[
          styles.footer,
          {
            height: footer,
            paddingBottom: bottom,
            backgroundColor: colors.surfaceElevated,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <IconButton
          onPress={toggleWorkoutReview}
          testID='playing.review'
          iconName={isWorkoutReview ? icon.timer : icon.list}
          color={colors.inverse}
          size={35}
        />
        <FlexSpaceBetween style={{ width: '50%' }}>
          <IconButton
            onPress={onPrevious}
            testID='playing.previous'
            disabled={playing.idx <= 0 && playing.lap <= 1}
            iconName={icon.skipPrevious}
            color={colors.inverse}
            size={35}
          />
          <IconButton
            onPress={onTogglePlay}
            testID={isPlaying ? 'playing.pause' : 'playing.play'}
            disabled={isTheLastOneComplete}
            iconName={isPlaying ? icon.pause : icon.play}
            color={colors.primary}
            size={45}
          />
          <IconButton
            onPress={onNext}
            testID='playing.next'
            disabled={isTheLastOneComplete}
            iconName={icon.skipNext}
            color={colors.inverse}
            size={35}
          />
        </FlexSpaceBetween>
        <IconButton
          onPress={onReload}
          iconName={icon.restart}
          color={colors.inverse}
          size={35}
          testID='playing.reload'
        />
      </FlexSpaceBetween>
      {isWorkoutReview && (
        <PlayingReview
          playingWorkout={playingWorkout}
          playingExerciseIdx={playing.idx}
          playingExerciseLap={playing.lap}
          isTheLastOneComplete={isTheLastOneComplete}
          onSaveResult={_onSaveResult}
        />
      )}
      {!isSubmitGoBack && <GoBackSubmitModal text={'Current results will be lost!'} onConfirm={onGoBack} />}
    </View>
  )
})
