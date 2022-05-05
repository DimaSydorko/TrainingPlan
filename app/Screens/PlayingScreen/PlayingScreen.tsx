import * as React from 'react'
import { memo } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import usePlaying from '../../Hooks/usePlaying'
import { screen } from '../../Utils/constants'
import { ButtonCounter, IconButton } from '../../Common'
import { secondsToMinSec } from '../../Common/WorkoutDuration/WorkoutDuration'
import { FlexCenterColumn, FlexSpaceBetween, TextHeader, TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'
import { colors } from '../../Theme/colors'
import { icon } from '../../Theme/icons'
import styles from './styles'

export default memo(function PlayingScreen() {
  const {
    isPlaying,
    playing,
    exercise,
    exerciseNext,
    approach,
    onTimerComplete,
    onTogglePlay,
    onNext,
    onBack,
    onPrevious,
    setCurrentWeight,
    setCurrentRepeats
  } = usePlaying()

  return (
    <SafeAreaView style={[theme.containers.centerColumn, styles.page]}>
      <View style={[theme.containers.headerStyle, styles.header]}>
        <FlexSpaceBetween>
          <Text>1</Text>
          <Text>
            Laps {playing.lap}/{exercise.laps}
          </Text>
          <Text>3</Text>
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
                {!!exerciseNext.approaches[0].weight && `    Weight ${exerciseNext.approaches[0].weight} kg`}
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
            duration={exercise.breakTimeInSec}
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

        <View style={{ width: screen.vw - 140 }}>
          <FlexSpaceBetween>
            <TextHeader color={colors.text}>Weight</TextHeader>
            <ButtonCounter value={approach.weight} step={5} dataType={' kg'} onChange={setCurrentWeight} />
          </FlexSpaceBetween>
          <FlexSpaceBetween>
            <TextHeader color={colors.text}>Repeats</TextHeader>
            <ButtonCounter value={approach.repeats} dataType={` / ${exercise.repeats}`} onChange={setCurrentRepeats} />
          </FlexSpaceBetween>
        </View>
      </FlexCenterColumn>

      <FlexSpaceBetween style={styles.footer}>
        <IconButton onPress={onBack} iconName={icon.back} color={colors.textSecondary} size={35} />
        <FlexSpaceBetween style={{ width: '50%' }}>
          <IconButton onPress={onPrevious} iconName={icon.skipPrevious} color={colors.black} size={35} />
          <IconButton
            onPress={onTogglePlay}
            iconName={isPlaying ? icon.pause : icon.play}
            color={colors.primary}
            size={45}
          />
          <IconButton onPress={onNext} iconName={icon.skipNext} color={colors.black} size={35} />
        </FlexSpaceBetween>
        <IconButton onPress={() => {}} iconName={icon.playlist} color={colors.black} size={35} />
      </FlexSpaceBetween>
    </SafeAreaView>
  )
})
