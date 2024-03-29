import * as React from 'react'
import { memo, useCallback, useEffect, useState } from 'react'
import { LayoutAnimation, SafeAreaView, TouchableOpacity, View } from 'react-native'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { useNavigation } from '@react-navigation/native'
import KeepAwake from 'react-native-keep-awake'

import usePlaying from '../../Hooks/usePlaying'
import { appScreen } from '../../Utils/constants'
import useTTS from '../../Hooks/useTTS'
import { useSettings } from '../../Hooks/redux'
import { getWorkoutDuration } from '../../Utils'
import { AppNavigationType } from '../../Utils/types'
import { AppImage, ConfirmButton, GoBackSubmitModal, IconButton } from '../../Common'
import { secondsToMinSec } from '../../Components/WorkoutDuration/WorkoutDuration'
import { FlexCenterColumn, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { COLORS_EXERCISE, colorsDark, colorsFixed } from '../../Theme/colors'
import { theme } from '../../Theme/theme'
import { icon } from '../../Theme/icons'

import PlayingReview from './PlayingReview/PlayingReview'
import Results from './components/Results'
import BackgroundAction from './components/BackgroundAction'
import TimeObserver from './components/TimeObserver'
import PlayHeader from './components/PlayHeader'
import styles from './styles'

export default memo(function PlayingScreen() {
  const { colors, workout, isSaveBatteryMode } = useSettings()
  const onSay = useTTS()
  const navigation = useNavigation<AppNavigationType>()
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
    onTimerComplete,
    onTogglePlay,
    onNext,
    onSaveResult,
    onPrevious,
    setCurrentRepeats,
    setCurrentWeight,
    onReload,
    playingWorkout,
  } = usePlaying()
  const [isWorkoutReview, setIsWorkoutReview] = useState<boolean>(false)
  const [isSubmitGoBack, setIsSubmitGoBack] = useState<boolean>(false)
  const [isInvisibleTimerCircle, setIsInvisibleTimerCircle] = useState<boolean>(false)

  const isDarkTheme = colors.primary === colorsDark.primary
  const color = COLORS_EXERCISE[exercise?.colorIdx || 0][+isDarkTheme]
  const isTheLastOneComplete = isWaitForSubmit && isTheLastOne

  const weightDiff = currentWeight - approach?.weight || 0
  const repeatsDiff = currentRepeats - approach?.repeats || 0

  const duration = isTheLastOneComplete ? 0 : exercise.breakTimeInSec
  const workoutDurationTime =
    getWorkoutDuration(playingWorkout.exercises.filter((ex, idx) => idx > playing.idx)) +
    (exercise.laps - playing.lap) * duration

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
    if (!isSaveBatteryMode) KeepAwake.activate()
    return () => !isSaveBatteryMode && KeepAwake.deactivate()
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
      playSound.play()
      setTimeout(() => onSay('Workout complete'), playSound.getDuration() * 1000)
    }
  }, [isTheLastOneComplete])

  const onGoBack = useCallback(() => {
    setIsSubmitGoBack(true)
  }, [])

  const _onSaveResult = useCallback(() => {
    setTimeout(() => onSaveResult(), 100)
    setIsSubmitGoBack(true)
  }, [onSaveResult])

  const onTimerUpdate = useCallback((remainingTime: number) => {
    const onTimeSay = (time: number[]) => {
      if (time.includes(remainingTime) && exercise.breakTimeInSec > remainingTime) onSay(`${remainingTime}`)
    }
    onTimeSay([10, 3, 2, 1])
  }, [])

  const toggleWorkoutReview = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsWorkoutReview(p => !p)
  }, [setIsWorkoutReview])

  return (
    <SafeAreaView style={[theme.containers.centerColumn, styles.page, { backgroundColor: colors.background }]}>
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
                  <TextSecondary center color={COLORS_EXERCISE[exerciseNext?.colorIdx || 0][+isDarkTheme]}>
                    {exerciseNext.name}
                  </TextSecondary>
                  <TextSecondary center>
                    Laps {exerciseNext.laps}
                    {!!exerciseNext.approaches[0]?.weight && `    Weight ${exerciseNext.approaches[0]?.weight} kg`}
                  </TextSecondary>
                </>
              ) : (
                <TextSecondary center color={colors.secondPrimary}>
                  Finish
                </TextSecondary>
              )}
            </>
          )}
        </View>

        <TouchableOpacity style={styles.timerContainer} onPress={onTogglePlay}>
          <CountdownCircleTimer
            key={`${playing.lap}_${playing.idx}_${playing.updated}`}
            isPlaying={isPlaying}
            duration={duration}
            colors={isInvisibleTimerCircle ? new Array(3).fill('#00000000') : (color as any)}
            colorsTime={[exercise.breakTimeInSec, exercise.breakTimeInSec / 2, 0]}
            strokeWidth={14}
            trailColor={colors.menu as any}
            onComplete={onTimerComplete}
            onUpdate={onTimerUpdate}
            size={appScreen.vw - 120}
          >
            {({ remainingTime }) => (
              <FlexCenterColumn style={styles.timerContent}>
                {!!exercise.imageUrl && <AppImage size={100} src={exercise.imageUrl} />}
                <TextHeader center color={color} style={{ fontSize: 24 }} ellipsizeMode='tail' numberOfLines={2}>
                  {exercise.name}
                </TextHeader>
                <TextHeader color={colors.text} style={{ fontSize: 22 }}>
                  {secondsToMinSec(remainingTime < 0 ? 0 : remainingTime, false)}
                </TextHeader>
                <TimeObserver time={remainingTime} />
              </FlexCenterColumn>
            )}
          </CountdownCircleTimer>
        </TouchableOpacity>

        {!!exercise.repeats && (
          <View style={{ width: appScreen.vw - 140 }}>
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
          <ConfirmButton header={'Save Result'} style={{ width: appScreen.vw - 80 }} onPress={onSaveResult} />
        )}
      </FlexCenterColumn>

      <FlexSpaceBetween
        style={[
          styles.footer,
          {
            backgroundColor: colors.menu,
            shadowColor: colorsFixed.shadow,
          },
        ]}
      >
        <IconButton
          onPress={toggleWorkoutReview}
          iconName={isWorkoutReview ? icon.timer : icon.list}
          color={colors.black}
          size={35}
        />
        <FlexSpaceBetween style={{ width: '50%' }}>
          <IconButton
            onPress={onPrevious}
            disabled={playing.idx <= 0 && playing.lap <= 1}
            iconName={icon.skipPrevious}
            color={colors.black}
            size={35}
          />
          <IconButton
            onPress={onTogglePlay}
            disabled={isTheLastOneComplete}
            iconName={isPlaying ? icon.pause : icon.play}
            color={colors.primary}
            size={45}
          />
          <IconButton
            onPress={onNext}
            disabled={isTheLastOneComplete}
            iconName={icon.skipNext}
            color={colors.black}
            size={35}
          />
        </FlexSpaceBetween>
        <IconButton onPress={onReload} iconName={icon.restart} color={colors.black} size={35} />
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
      {!isSaveBatteryMode && (
        <BackgroundAction
          color={color}
          duration={duration}
          taskName={playingWorkout.name}
          taskTitle={playingWorkout.name}
          taskDesc={`${exercise.name}:  ${playing.lap}/${exercise.laps}`}
        />
      )}
    </SafeAreaView>
  )
})
