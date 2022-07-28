import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useUser } from '../Hooks/redux'
import { Loading } from '../Common'
import { ScreenName } from '../Utils/constants'
import { ProfileScreen, SettingsScreen } from '../Screens'
import { useScreenOptions } from '../Theme/Parents'

export default memo(function ProfileRouter() {
  const Stack = createStackNavigator()
  const options = useScreenOptions()
  const user = useUser()

  return (
    <>
      {user.isLoading && <Loading />}
      <Stack.Navigator>
        <Stack.Screen name={ScreenName.Profile} options={{ ...options, title: 'Profile' }}>
          {() => <ProfileScreen />}
        </Stack.Screen>
        <Stack.Screen name={ScreenName.Settings} options={{ ...options, title: 'Settings' }}>
          {() => <SettingsScreen />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  )
})
