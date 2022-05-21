import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'
import { MyWorkoutsScreen, WorkoutScreen } from '../Screens'
import { useSettings, useWorkout } from '../Hooks/redux'

export default memo(function WorkoutsRouter() {
  const Stack = createStackNavigator()
  const { selectedWorkout } = useWorkout()
  const { colors } = useSettings()

  const options = {
    ...theme.screenOptions,
    headerTintColor: colors.text,
    headerStyle: {
      ...theme.containers.headerStyle,
      backgroundColor: colors.menu,
      shadowColor: colors.black
    }
  }
  return (
    <>
      <Stack.Navigator>
        <Stack.Screen name={ScreenName.SavedWorkouts} options={{ ...options, title: 'All saved Workouts' }}>
          {() => <MyWorkoutsScreen />}
        </Stack.Screen>
        <Stack.Screen name={ScreenName.Workout} options={{ ...options, title: selectedWorkout?.name }}>
          {() => <WorkoutScreen />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  )
})
