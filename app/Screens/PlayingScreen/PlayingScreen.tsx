import * as React from 'react'
import { memo } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import usePlaying from '../../Hooks/usePlaying'
import { screen } from '../../Utils/constants'
import { ConfirmButton, GoBackSubmitModal, IconButton } from '../../Common'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { FlexCenterColumn, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import Results from './Results'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'
import styles from './styles'
import { useAppDispatch } from '../../Hooks/redux'
import { togglePlaying } from '../../store/WorkoutReducer/WorkoutSlice'

export default memo(function PlayingScreen() {
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
    onReload
  } = usePlaying()
  const dispatch = useAppDispatch()
  const repeatsDiff = current?.repeats - approach?.repeats || 0
  const weightDiff = current?.weight - approach?.weight || 0
  const isTheLastOneComplete = isWaitForSubmit && isTheLastOne
  return (
    <SafeAreaView style={[theme.containers.centerColumn, styles.page]}>
      <View style={[theme.containers.headerStyle, styles.header]}>
        <FlexSpaceBetween>
          <Text />
          <TextHeader>
            Laps {playing.lap}/{exercise.laps}
          </TextHeader>
          <Text />
        </FlexSpaceBetween>
      </View>

      <FlexCenterColumn>
        <View style={styles.nextExercise}>
          <TextSecondary center>Next up</TextSecondary>
          {!!exerciseNext ? (
            <>
              <TextSecondary center color={colors.secondPrimary}>
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
            colors={[colors.primary, colors.primary, colors.secondPrimary] as any}
            colorsTime={[11, 10, 0]}
            onComplete={onTimerComplete}
            size={screen.vw - 120}
          >
            {({ remainingTime }) => (
              <FlexCenterColumn style={styles.timerContent}>
                <TextHeader center color={colors.secondPrimary} style={{ fontSize: 24 }}>
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
              value={current.weight}
              onChange={v => setCurrent(p => ({ ...p, weight: v }))}
              diff={weightDiff}
            />
            <Results
              type={'repeats'}
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

      <FlexSpaceBetween style={styles.footer}>
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
      <GoBackSubmitModal text={'Current results will be lost!'} onConfirm={() => dispatch(togglePlaying(false))} />
    </SafeAreaView>
  )
})