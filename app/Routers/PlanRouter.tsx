import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans, useUser, useWorkout } from '../Hooks/redux'
import { MyPlansScreen, PlayingScreen, WorkoutScreen, WorkoutsScreen } from '../Screens'
import { useScreenOptions } from '../Theme/Parents'
import { Loading } from '../Common'
import { ScreenName } from '../Utils/constants'

export default memo(function PlanRouter() {
  const Stack = createStackNavigator()
  const options = useScreenOptions()
  const user = useUser()

  const workout = useWorkout()
  const plans = usePlans()

  return (
    <>
      {(workout.isLoading || plans.isLoading || user.isLoading) && <Loading />}
      <Stack.Navigator>
        <Stack.Screen
          name={ScreenName.SavedWorkouts}
          options={{ ...options, title: 'All saved Plans' }}
          component={MyPlansScreen}
        />
        <Stack.Screen name={ScreenName.Plan} options={{ ...options, title: plans.selectedPlan?.name }}>
          {() => <WorkoutsScreen isInPlan />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenName.WorkoutInPlan}
          options={{ ...options, title: workout.selectedWorkout?.name }}
          component={WorkoutScreen}
        />
        <Stack.Screen
          name={ScreenName.Playing}
          options={{ ...options, headerShown: false }}
          component={PlayingScreen}
        />
      </Stack.Navigator>
    </>
  )
})
