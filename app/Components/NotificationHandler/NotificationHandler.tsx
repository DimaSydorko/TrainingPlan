import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { useAppDispatch, usePlans, usePublications, useSettings, useWorkout } from '../../Hooks/redux'
import { errorPlansClear } from '../../store/PlansReducer/PlansSlice'
import { errorWorkoutClear } from '../../store/WorkoutReducer/WorkoutSlice'
import { errorPublicationClear } from '../../store/PublicationsReducer/PublicationsSlice'
import { Toast, Toaster } from '../../Common'
import { icon } from '../../Theme/icons'
import { LayoutAnimation } from 'react-native'

export default memo(function NotificationHandler() {
  const dispatch = useAppDispatch()
  const plans = usePlans()
  const workout = useWorkout()
  const publications = usePublications()
  const { internet } = useSettings()
  const [isInternetInfo, setIsInternetInfo] = useState<boolean>(false)

  useEffect(() => {
    // for first loading
    if (internet.isOnline) setIsInternetInfo(false)
    else setTimeout(() => setIsInternetInfo(true), 1000)
  }, [internet.isOnline])

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
        isInternetInfo && !internet.isOnline && (
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
