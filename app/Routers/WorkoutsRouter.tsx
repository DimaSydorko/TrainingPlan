import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans, useUser, useWorkout } from '../Hooks/redux'
import { WorkoutScreen, WorkoutsScreen } from '../Screens'
import { useScreenOptions } from '../Theme/Parents'
import { Loading } from '../Common'
import { ScreenName } from '../Utils/constants'

export default memo(function WorkoutsRouter() {
  const Stack = createStackNavigator()
  const options = useScreenOptions()
  const { selectedWorkout, isLoading } = useWorkout()
  const plans = usePlans()
  const user = useUser()

  return (
    <>
      {(isLoading || plans.isLoading || user.isLoading) && <Loading />}
      <Stack.Navigator>
        <Stack.Screen
          name={ScreenName.SavedWorkouts}
          options={{ ...options, title: 'All saved Workouts' }}
          component={WorkoutsScreen}
        />
        <Stack.Screen
          name={ScreenName.Workout}
          options={{ ...options, title: selectedWorkout?.name }}
          component={WorkoutScreen}
        />
      </Stack.Navigator>
    </>
  )
})
