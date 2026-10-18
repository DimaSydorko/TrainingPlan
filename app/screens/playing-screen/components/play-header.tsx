import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { useSettings } from '@hooks/redux'
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
