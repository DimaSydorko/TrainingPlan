import * as React from 'react'
import { memo } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import useSelectedWorkout from '@hooks/use-selected-workout'
import { Loading } from '@common'
import { PlayingRouteParams } from '@utils/types'
import { PlayTimerProvider } from './components/play-timer-provider'
import PlayingScreen from './playing-screen'

export default memo(function PlayingScreenWithTimer() {
  const { params } = useRoute<RouteProp<Record<string, PlayingRouteParams>, string>>()
  const { workout } = useSelectedWorkout({ workoutId: params?.workoutId, planId: params?.planId })

  if (!workout) return <Loading />

  return (
    <PlayTimerProvider>
      <PlayingScreen />
    </PlayTimerProvider>
  )
})
