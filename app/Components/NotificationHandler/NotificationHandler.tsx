import * as React from 'react'
import { useAppDispatch, usePlans, useWorkout } from '../../Hooks/redux'
import { errorPlansClear } from '../../store/PlansReducer/PlansSlice'
import { errorWorkoutClear } from '../../store/WorkoutReducer/WorkoutSlice'
import { Toast, Toaster } from '../../Common'

export default React.memo(function NotificationHandler() {
  const dispatch = useAppDispatch()
  const plans = usePlans()
  const workout = useWorkout()

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
        )
      ]}
    />
  )
})
