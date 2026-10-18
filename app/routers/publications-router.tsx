import * as React from 'react'
import { memo, useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useAppDispatch, useSettings } from '@hooks/redux'
import { ScreenName } from '@utils/constants'
import { useScreenOptions } from '@theme/parents'
import { PublicationsScreen } from '@screens'
import { publicationsAC } from '@store/publications-reducer/publications-ac'
import PublicationPlan from '@screens/publications-screen/publication-plan'
import PublicationWorkout from '@screens/publications-screen/publication-workout'
import { PublicationsStackParamList } from '@utils/types'

const Stack = createStackNavigator<PublicationsStackParamList, 'PublicationsStack'>()

export default memo(function PublicationsRouter() {
  const dispatch = useAppDispatch()
  const options = useScreenOptions()
  const { internet } = useSettings()

  useEffect(() => {
    if (internet.isOnline) {
      dispatch(publicationsAC.get({}))
    }
  }, [internet.isOnline])

  return (
    <Stack.Navigator id='PublicationsStack'>
      <Stack.Screen
        name={ScreenName.Publications}
        options={{ ...options, title: 'Publications' }}
        component={PublicationsScreen}
      />
      <Stack.Screen
        name={ScreenName.PublicationPlan}
        options={{ ...options, title: 'Plan' }}
        component={PublicationPlan}
      />
      <Stack.Screen
        name={ScreenName.PublicationWorkout}
        options={{ ...options, title: 'Workout' }}
        component={PublicationWorkout}
      />
    </Stack.Navigator>
  )
})
