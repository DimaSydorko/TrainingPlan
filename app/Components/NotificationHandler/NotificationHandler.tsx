import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { useAppDispatch, usePlans, useSettings, useWorkout } from '../../Hooks/redux'
import { errorPlansClear } from '../../store/PlansReducer/PlansSlice'
import { errorWorkoutClear } from '../../store/WorkoutReducer/WorkoutSlice'
import { Toast, Toaster } from '../../Common'

export default memo(function NotificationHandler() {
  const dispatch = useAppDispatch()
  const plans = usePlans()
  const workout = useWorkout()
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
            onPress={() => dispatch(errorPlansClear())}
            variant='error'
            message={plans.error}
            pressAfterTime={16000}
          />
        ),
        !!workout.error && (
          <Toast
            onPress={() => dispatch(errorWorkoutClear())}
            variant='error'
            message={workout.error}
            pressAfterTime={16000}
          />
        ),
        isInternetInfo && !internet.isOnline && (
          <Toast
            variant='info'
            message={'No internet connection'}
            onPress={() => setIsInternetInfo(false)}
            pressAfterTime={8000}
          />
        ),
      ]}
    />
  )
})
