import * as React from 'react'
import { memo, useCallback, useContext, useEffect, useState } from 'react'
import { SafeAreaView, TouchableOpacity, View } from 'react-native'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import KeepAwake from 'react-native-keep-awake'
import usePlaying from '../../Hooks/usePlaying'
import { screen } from '../../Utils/constants'
import useTTS from '../../Hooks/useTTS'
import { useSettings } from '../../Hooks/redux'
import { PlayContext } from '../../Hooks/PlayProvider'
import { AppImage, ConfirmButton, GoBackSubmitModal, IconButton, Timer } from '../../Common'
import { secondsToMinSec } from '../../Components/WorkoutDuration/WorkoutDuration'
import { FlexCenterColumn, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { getWorkoutDuration } from '../../Utils'
import Results from './Results'
import { colorsFixed } from '../../Theme/colors'
import { theme } from '../../Theme/theme'
import { icon } from '../../Theme/icons'
import styles from './styles'

export default memo(function PlayingScreen() {
  const { colors } = useSettings()
  const onSay = useTTS()
  const { onTogglePlaying } = useContext(PlayContext)
  const {
    isPlaying,
    isWaitForSubmit,
    isTheLastOne,
    playing,
    exercise,
    current,
    approach,
    exerciseNext,
    onTimerComplete,
    onTogglePlay,
    onNext,
    onSaveResult,
    onPrevious,
    setCurrent,
    onReload,
    playingWorkout
  } = usePlaying()
  const repeatsDiff = current?.repeats - approach?.repeats || 0
  const workoutDurationTime = getWorkoutDuration(playingWorkout.exercises.filter((ex, idx) => idx >= playing.idx))
  const weightDiff = current?.weight - approach?.weight || 0
  const isTheLastOneComplete = isWaitForSubmit && isTheLastOne
  const [isInvisibleTimerCircle, setIsInvisibleTimerCircle] = useState<boolean>(false)
  const color = exercise.color || colors.primary

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
    KeepAwake.activate()
    return () => KeepAwake.deactivate()
  }, [])

  useEffect(() => {
    onSay(exercise.name)
  }, [playing.lap, exercise.name])

  useEffect(() => {
    isTheLastOneComplete && onSay('Workout complete')
  }, [isTheLastOneComplete])

  const onTimerUpdate = useCallback((remainingTime: number) => {
    const onTimeSay = (time: number[]) => {
      if (time.includes(remainingTime) && exercise.breakTimeInSec > remainingTime) onSay(`${remainingTime}`)
    }
    onTimeSay([10, 3, 2, 1])
  }, [])

  return (
    <SafeAreaView style={[theme.containers.centerColumn, styles.page, { backgroundColor: colors.background }]}>
      <View style={[theme.containers.headerStyle, styles.header]}>
        <FlexSpaceBetween>
          <Timer />
          <TextHeader>
            Laps {playing.lap}/{exercise.laps}
          </TextHeader>
          <Timer isRevers isPaused={!isPlaying} value={workoutDurationTime} />
        </FlexSpaceBetween>
      </View>

      <FlexCenterColumn>
        <View style={styles.nextExercise}>
          <TextSecondary center>Next up</TextSecondary>
          {!!exerciseNext ? (
            <>
              <TextSecondary center color={exerciseNext.color || colors.primary}>
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
        </View>
        <TouchableOpacity style={styles.timerContainer} onPress={onTogglePlay}>
          <CountdownCircleTimer
            key={`${playing.lap}_${playing.idx}_${playing.updated}`}
            isPlaying={isPlaying}
            duration={isTheLastOneComplete ? 0 : exercise.breakTimeInSec}
            colors={isInvisibleTimerCircle ? new Array(3).fill('#00000000') : ([color, color, colors.error] as any)}
            colorsTime={[exercise.breakTimeInSec, exercise.breakTimeInSec / 2, 0]}
            strokeWidth={14}
            trailColor={colors.menu as any}
            onComplete={onTimerComplete}
            onUpdate={onTimerUpdate}
            size={screen.vw - 120}
          >
            {({ remainingTime }) => (
              <FlexCenterColumn style={styles.timerContent}>
                {!!exercise.imageUrl && <AppImage size={100} src={exercise.imageUrl} />}
                <TextHeader center color={color} style={{ fontSize: 24 }}>
                  {exercise.name}
                </TextHeader>
                <TextHeader color={colors.text} style={{ fontSize: 22 }}>
                  {secondsToMinSec(remainingTime, false)}
                </TextHeader>
              </FlexCenterColumn>
            )}
          </CountdownCircleTimer>
        </TouchableOpacity>

        {!!exercise.repeats && (
          <View style={{ width: screen.vw - 140 }}>
            <Results
              type={'weight'}
              step={5}
              color={color}
              value={current.weight}
              onChange={v => setCurrent(p => ({ ...p, weight: v }))}
              diff={weightDiff}
            />
            <Results
              type={'repeats'}
              color={color}
              value={current.repeats}
              repeats={exercise.repeats}
              onChange={v => setCurrent(p => ({ ...p, repeats: v }))}
              diff={repeatsDiff}
            />
          </View>
        )}
        {isTheLastOneComplete && (
          <ConfirmButton header={'Save Result'} style={{ width: screen.vw - 80 }} onPress={onSaveResult} />
        )}
      </FlexCenterColumn>

      <FlexSpaceBetween
        style={[
          styles.footer,
          {
            backgroundColor: colors.menu,
            shadowColor: colorsFixed.shadow
          }
        ]}
      >
        <IconButton onPress={() => {}} iconName={icon.back} color={`${colors.error}00`} size={35} />
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
      <GoBackSubmitModal text={'Current results will be lost!'} onConfirm={onTogglePlaying} />
    </SafeAreaView>
  )
})
