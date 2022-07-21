import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { Timer } from '../../../Common'
import { theme } from '../../../Theme/theme'
import { FlexSpaceBetween, TextHeader, TextSecondary } from '../../../Theme/Parents'
import { usePlayTimerContext } from './PlayTimerProvider'
import styles from '../styles'
import { secondsToMinSec } from '../../../Components/WorkoutDuration/WorkoutDuration'
import { useSettings } from '../../../Hooks/redux'

interface IProps {
  playingLap: number
  exerciseLaps: number
  workoutDurationTime: number
  isPlaying: boolean
}

export default memo(function PlayHeader({ playingLap, exerciseLaps, workoutDurationTime }: IProps) {
  const { playTimer } = usePlayTimerContext()
  const { colors } = useSettings()
  return (
    <View style={[theme.containers.headerStyle, styles.header]}>
      <FlexSpaceBetween>
        <Timer />
        <TextHeader>
          Laps {playingLap}/{exerciseLaps}
        </TextHeader>
        <TextSecondary color={colors.text}>
          {secondsToMinSec(workoutDurationTime + playTimer, false, true)}
        </TextSecondary>
      </FlexSpaceBetween>
    </View>
  )
})
