import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { useSettings } from '../../../Hooks/redux'
import { Timer } from '../../../Common'
import { usePlayTimerContext } from './PlayTimerProvider'
import { secondsToMinSec } from '../../../Components/WorkoutDuration/WorkoutDuration'
import { theme } from '../../../Theme/theme'
import { FlexSpaceBetween, TextHeader, TextSecondary } from '../../../Theme/Parents'
import styles from '../styles'

interface IProps {
  playingLap: number
  exerciseLaps: number
  workoutDurationTime: number
  isPlaying: boolean
}

export default memo(function PlayHeader({ playingLap, exerciseLaps, workoutDurationTime }: IProps) {
  const { playTimer } = usePlayTimerContext()
  const { colors } = useSettings()
  const time = workoutDurationTime + playTimer
  return (
    <View style={[theme.containers.headerStyle, styles.header]}>
      <FlexSpaceBetween>
        <Timer />
        <TextHeader>
          Laps {playingLap}/{exerciseLaps}
        </TextHeader>
        <TextSecondary color={colors.text}>{secondsToMinSec(time > 0 ? time : 0, false, true)}</TextSecondary>
      </FlexSpaceBetween>
    </View>
  )
})
