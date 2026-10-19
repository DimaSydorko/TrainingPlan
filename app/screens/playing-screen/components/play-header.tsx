import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'
import { Timer } from '@common'
import { usePlayTimerContext } from './play-timer-provider'
import { secondsToMinSec } from '@components/workout-duration/workout-duration'
import Stack from '@common/stack/stack'
import AppText from '@common/app-text/app-text'
import styles from '../styles'

interface IProps {
  playingLap: number
  exerciseLaps: number
  workoutDurationTime: number
  isPlaying: boolean
}

export default memo(function PlayHeader({ playingLap, exerciseLaps, workoutDurationTime }: IProps) {
  const { playTimer } = usePlayTimerContext()
  const time = workoutDurationTime + playTimer
  return (
    <View style={styles.header}>
      <Stack preset='spaceBetween'>
        <Timer />
        <AppText variant='title'>
          Laps {playingLap}/{exerciseLaps}
        </AppText>
        <AppText variant='caption'>{secondsToMinSec(time > 0 ? time : 0, false, true)}</AppText>
      </Stack>
    </View>
  )
})
