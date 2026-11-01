import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { PlayingScreen, WorkoutScreen, WorkoutsScreen } from '@screens'
import { useScreenOptions } from '@theme/navigation-theme'
import { ScreenName } from '@utils/constants'
import { WorkoutsStackParamList } from '@utils/types'

const Stack = createStackNavigator<WorkoutsStackParamList, 'WorkoutsStack'>()

export default memo(function WorkoutsRouter() {
  const options = useScreenOptions()

  return (
    <>
      <Stack.Navigator id='WorkoutsStack'>
        <Stack.Screen
          name={ScreenName.SavedWorkouts}
          options={{ ...options, title: 'All saved Workouts' }}
          component={WorkoutsScreen}
        />
        <Stack.Screen name={ScreenName.Workout} options={options} component={WorkoutScreen} />
        <Stack.Screen
          name={ScreenName.Playing}
          options={{ ...options, headerShown: false }}
          component={PlayingScreen}
        />
      </Stack.Navigator>
    </>
  )
})
