import React, { useState } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans, useUser, useWorkout } from '../Hooks/redux'
import { MyPlansScreen, PlanScreen, WorkoutScreen } from '../Screens'
import NotificationHandler from '../Components/NotificationHandler/NotificationHandler'
import Loading from '../Common/Loading/Loading'
import { ScreenName } from '../Utils/constants'
import { PlanType } from '../Utils/types'
import { theme } from '../Theme/theme'

export default function PlanRouter() {
  const Stack = createStackNavigator()
  const workout = useWorkout()
  const plans = usePlans()
  const user = useUser()

  return (
    <>
      <NotificationHandler />
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
          {() => <PlanScreen isInPlan />}
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
}
