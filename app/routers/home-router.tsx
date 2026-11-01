import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { usePlans } from '@hooks/redux'
import { HomeScreen, PlayingScreen, WorkoutScreen } from '@screens'
import { useScreenOptions } from '@theme/navigation-theme'
import { Loading } from '@common'
import { ScreenName } from '@utils/constants'
import { HomeStackParamList } from '@utils/types'

const Stack = createStackNavigator<HomeStackParamList, 'HomeStack'>()

export default memo(function HomeRouter() {
  const options = useScreenOptions()
  const plans = usePlans()

  return (
    <>
      {plans.isLoading && <Loading />}
      <Stack.Navigator id='HomeStack'>
        <Stack.Screen name={ScreenName.Home} options={{ ...options, headerShown: false }} component={HomeScreen} />
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
