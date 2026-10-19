import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { useAppDispatch, usePlans, usePublications, useWorkout } from '@hooks/redux'
import { useIsOnline } from '@stores/network/use-network-store'
import { errorPlansClear } from '@store/plans-reducer/plans-slice'
import { errorWorkoutClear } from '@store/workout-reducer/workout-slice'
import { errorPublicationClear } from '@store/publications-reducer/publications-slice'
import { Toast, Toaster } from '@common'
import { icon } from '@theme/icons'
import { LayoutAnimation } from 'react-native'

export default memo(function NotificationHandler() {
  const dispatch = useAppDispatch()
  const plans = usePlans()
  const workout = useWorkout()
  const publications = usePublications()
  const isOnline = useIsOnline()
  const [isInternetInfo, setIsInternetInfo] = useState<boolean>(false)

  useEffect(() => {
    // for first loading
    if (isOnline) setIsInternetInfo(false)
    else setTimeout(() => setIsInternetInfo(true), 1000)
  }, [isOnline])

  return (
    <Toaster
      toasts={[
        !!plans.error && (
          <Toast
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              dispatch(errorPlansClear())
            }}
            variant='error'
            message={plans.error}
            pressAfterTime={16000}
          />
        ),
        !!workout.error && (
          <Toast
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              dispatch(errorWorkoutClear())
            }}
            variant='error'
            message={workout.error}
            pressAfterTime={16000}
          />
        ),
        !!publications.error && (
          <Toast
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              dispatch(errorPublicationClear())
            }}
            variant='error'
            message={publications.error}
            pressAfterTime={16000}
          />
        ),
        isInternetInfo && !isOnline && (
          <Toast
            variant='info'
            iconName={icon.wifiOff}
            message={'No internet connection'}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              setIsInternetInfo(false)
            }}
            pressAfterTime={6000}
          />
        ),
      ]}
    />
  )
})
