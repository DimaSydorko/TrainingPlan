import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans, useUser, useWorkout } from '@hooks/redux'
import { HomeScreen, PlayingScreen, WorkoutScreen } from '@screens'
import { useScreenOptions } from '@theme/navigation-theme'
import { Loading } from '@common'
import { ScreenName } from '@utils/constants'
import { HomeStackParamList } from '@utils/types'

const Stack = createStackNavigator<HomeStackParamList, 'HomeStack'>()

export default memo(function HomeRouter() {
  const options = useScreenOptions()
  const { selectedWorkout, isLoading } = useWorkout()
  const plans = usePlans()
  const user = useUser()

  return (
    <>
      {(isLoading || plans.isLoading || user.isLoading) && <Loading />}
      <Stack.Navigator id='HomeStack'>
        <Stack.Screen name={ScreenName.Home} options={{ ...options, headerShown: false }} component={HomeScreen} />
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
