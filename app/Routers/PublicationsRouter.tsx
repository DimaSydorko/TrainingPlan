import * as React from 'react'
import { memo, useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useAppDispatch, useSettings } from '../Hooks/redux'
import { ScreenName } from '../Utils/constants'
import { useScreenOptions } from '../Theme/Parents'
import { PublicationsScreen } from '../Screens'
import { publicationsAC } from '../store/PublicationsReducer/PublicationsAC'
import PublicationPlan from '../Screens/PublicationsScreen/PublicationPlan'
import PublicationWorkout from '../Screens/PublicationsScreen/PublicationWorkout'

export default memo(function PublicationsRouter() {
  const dispatch = useAppDispatch()
  const Stack = createStackNavigator()
  const options = useScreenOptions()
  const { internet } = useSettings()

  useEffect(() => {
    if (internet.isOnline) {
      dispatch(publicationsAC.get({}))
    }
  }, [internet.isOnline])

  return (
    <>
      <Stack.Navigator>
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
    </>
  )
})
