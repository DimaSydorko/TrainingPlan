import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans, useSettings, useWorkout } from '../Hooks/redux'
import { MyPlansScreen, WorkoutScreen, WorkoutsScreen } from '../Screens'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'
import { colorsFixed } from '../Theme/colors'

export default memo(function PlanRouter() {
  const Stack = createStackNavigator()
  const { colors } = useSettings()

  const workout = useWorkout()
  const plans = usePlans()
  const options = {
    ...theme.screenOptions,
    headerTintColor: colors.text,
    headerStyle: {
      ...theme.containers.headerStyle,
      backgroundColor: colors.menu,
      shadowColor: colorsFixed.shadow
    }
  }
  return (
    <>
      <Stack.Navigator>
        <Stack.Screen name={ScreenName.SavedWorkouts} options={{ ...options, title: 'All saved Plans' }}>
          {() => <MyPlansScreen />}
        </Stack.Screen>
        <Stack.Screen name={ScreenName.Plan} options={{ ...options, title: plans.selectedPlan?.name }}>
          {() => <WorkoutsScreen isInPlan />}
        </Stack.Screen>
        <Stack.Screen name={ScreenName.WorkoutInPlan} options={{ ...options, title: workout.selectedWorkout?.name }}>
          {() => <WorkoutScreen />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  )
})
