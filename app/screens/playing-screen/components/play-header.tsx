import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import { Timer } from '@common'
import { usePlayTimerContext } from './play-timer-provider'
import { secondsToMinSec } from '@components/workout-duration/workout-duration'
import { theme } from '@theme/theme'
import { FlexSpaceBetween, TextHeader, TextSecondary } from '@theme/parents'
import styles from '../styles'

interface IProps {
  playingLap: number
  exerciseLaps: number
  workoutDurationTime: number
  isPlaying: boolean
}

export default memo(function PlayHeader({ playingLap, exerciseLaps, workoutDurationTime }: IProps) {
  const { playTimer } = usePlayTimerContext()
  const { colors } = useAppTheme()
  const time = workoutDurationTime + playTimer
  return (
    <View style={[theme.containers.headerStyle, styles.header]}>
      <FlexSpaceBetween>
        <Timer />
        <TextHeader>
          Laps {playingLap}/{exerciseLaps}
        </TextHeader>
        <TextSecondary color={colors.textPrimary}>{secondsToMinSec(time > 0 ? time : 0, false, true)}</TextSecondary>
      </FlexSpaceBetween>
    </View>
  )
})
