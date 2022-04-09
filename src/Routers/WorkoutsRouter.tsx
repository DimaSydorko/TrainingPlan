import React, { useState } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'
import { MyWorkoutsScreen, WorkoutScreen } from '../Screens'
import { PlanType } from '../Utils/types'
import { useWorkout } from '../Hooks/redux'

export default function WorkoutsRouter() {
  const Stack = createStackNavigator()
  const { selectedWorkout } = useWorkout()

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ScreenName.SavedWorkouts}
        options={{ ...theme.screenOptions, title: 'All saved Workouts' }}
      >
        {() => <MyWorkoutsScreen />}
      </Stack.Screen>
      <Stack.Screen
        name={ScreenName.Workout}
        options={{ ...theme.screenOptions, title: selectedWorkout?.name }}
      >
        {() => <WorkoutScreen />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}