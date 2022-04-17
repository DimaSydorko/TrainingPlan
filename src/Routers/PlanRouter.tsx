import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans, useUser, useWorkout } from '../Hooks/redux'
import { MyPlansScreen, WorkoutScreen, WorkoutsScreen } from '../Screens'
import Loading from '../Common/Loading/Loading'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'

export default React.memo(function PlanRouter() {
  const Stack = createStackNavigator()
  const workout = useWorkout()
  const plans = usePlans()
  const user = useUser()

  return (
    <>
      {(workout.isLoading || plans.isLoading || user.isLoading) && <Loading />}
      <Stack.Navigator>
        <Stack.Screen
          name={ScreenName.SavedWorkouts}
          options={{ ...theme.screenOptions, title: 'All saved Plans' }}
        >
          {() => <MyPlansScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenName.Plan}
          options={{ ...theme.screenOptions, title: plans.selectedPlan?.name }}
        >
          {() => <WorkoutsScreen isInPlan />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenName.WorkoutInPlan}
          options={{ ...theme.screenOptions, title: workout.selectedWorkout?.name }}
        >
          {() => <WorkoutScreen />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  )
})
