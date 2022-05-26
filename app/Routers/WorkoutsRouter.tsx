import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans, useSettings, useUser, useWorkout } from '../Hooks/redux'
import { MyWorkoutsScreen, WorkoutScreen } from '../Screens'
import { Loading } from '../Common'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'

export default memo(function WorkoutsRouter() {
  const Stack = createStackNavigator()
  const { selectedWorkout, isLoading } = useWorkout()
  const { colors } = useSettings()
  const plans = usePlans()
  const user = useUser()

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
      {(isLoading || plans.isLoading || user.isLoading) && <Loading />}
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
