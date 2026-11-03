import * as React from 'react'
import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useUser } from '@hooks/redux'
import { Loading } from '@common'
import { ScreenName } from '@utils/constants'
import { ProfileScreen } from '@screens'
import { ProfileStackParamList } from '@utils/types'
import useRootScreenOptions from './use-root-screen-options'

const Stack = createStackNavigator<ProfileStackParamList, 'ProfileStack'>()

export default memo(function ProfileRouter() {
  const rootOptions = useRootScreenOptions('Profile')
  const user = useUser()

  return (
    <>
      {user.isLoading && <Loading />}
      <Stack.Navigator id='ProfileStack'>
        <Stack.Screen name={ScreenName.Profile} options={rootOptions} component={ProfileScreen} />
      </Stack.Navigator>
    </>
  )
})
