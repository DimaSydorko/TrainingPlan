import * as React from 'react'
import { memo, useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useAppDispatch, useSettings, useUser } from '../Hooks/redux'
import { Loading } from '../Common'
import { ScreenName } from '../Utils/constants'
import { ProfileScreen, SettingsScreen } from '../Screens'
import { useScreenOptions } from '../Theme/Parents'
import { publicationsAC } from '../store/PublicationsReducer/PublicationsAC'

export default memo(function ProfileRouter() {
  const Stack = createStackNavigator()
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
