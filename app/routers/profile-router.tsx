import * as React from 'react'
import { memo, useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useAppDispatch, useSettings, useUser } from '../hooks/redux'
import { Loading } from '../common'
import { ScreenName } from '../utils/constants'
import { ProfileScreen, SettingsScreen } from '../screens'
import { useScreenOptions } from '../theme/parents'
import { publicationsAC } from '../store/publications-reducer/publications-ac'
import PublicationPlan from '../screens/publications-screen/publication-plan'
import PublicationWorkout from '../screens/publications-screen/publication-workout'
import { ProfileStackParamList } from '../utils/types'

const Stack = createStackNavigator<ProfileStackParamList, 'ProfileStack'>()

export default memo(function ProfileRouter() {
  const dispatch = useAppDispatch()
  const options = useScreenOptions()
  const user = useUser()
  const { internet } = useSettings()

  useEffect(() => {
    if (internet.isOnline) {
      dispatch(publicationsAC.get({ isYours: true }))
    }
  }, [internet.isOnline])

  return (
    <>
      {user.isLoading && <Loading />}
      <Stack.Navigator id='ProfileStack'>
        <Stack.Screen name={ScreenName.Profile} options={{ ...options, title: 'Profile' }} component={ProfileScreen} />
        <Stack.Screen
          name={ScreenName.Settings}
          options={{ ...options, title: 'Settings' }}
          component={SettingsScreen}
        />
        {/* The profile lists the user's own publications (components/publication). Opening one stays in
            this tab; before, navigate() targeted screens that only existed in the Publications stack. */}
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
