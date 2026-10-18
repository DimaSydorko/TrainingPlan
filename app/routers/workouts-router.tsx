import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans, useUser, useWorkout } from '@hooks/redux'
import { PlayingScreen, WorkoutScreen, WorkoutsScreen } from '@screens'
import { useScreenOptions } from '@theme/parents'
import { Loading } from '@common'
import { ScreenName } from '@utils/constants'
import { WorkoutsStackParamList } from '@utils/types'

const Stack = createStackNavigator<WorkoutsStackParamList, 'WorkoutsStack'>()

export default memo(function WorkoutsRouter() {
  const options = useScreenOptions()
  const { selectedWorkout, isLoading } = useWorkout()
  const plans = usePlans()
  const user = useUser()

  return (
    <>
      {(isLoading || plans.isLoading || user.isLoading) && <Loading />}
      <Stack.Navigator id='WorkoutsStack'>
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
        <Stack.Screen
          name={ScreenName.Playing}
          options={{ ...options, headerShown: false }}
          component={PlayingScreen}
        />
      </Stack.Navigator>
    </>
  )
})
