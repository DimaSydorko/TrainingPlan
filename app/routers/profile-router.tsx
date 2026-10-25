import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useUser } from '@hooks/redux'
import { Loading } from '@common'
import { ScreenName } from '@utils/constants'
import { ProfileScreen, SettingsScreen } from '@screens'
import { useScreenOptions } from '@theme/navigation-theme'
import { ProfileStackParamList } from '@utils/types'

const Stack = createStackNavigator<ProfileStackParamList, 'ProfileStack'>()

export default memo(function ProfileRouter() {
  const options = useScreenOptions()
  const user = useUser()

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
      </Stack.Navigator>
    </>
  )
})
