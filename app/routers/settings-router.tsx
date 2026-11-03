import { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import { SettingsScreen } from '@screens'
import { ScreenName } from '@utils/constants'
import { SettingsStackParamList } from '@utils/types'
import useRootScreenOptions from './use-root-screen-options'

const Stack = createStackNavigator<SettingsStackParamList, 'SettingsStack'>()

export default memo(function SettingsRouter() {
  const rootOptions = useRootScreenOptions('Settings')

  return (
    <Stack.Navigator id='SettingsStack'>
      <Stack.Screen name={ScreenName.Settings} options={rootOptions} component={SettingsScreen} />
    </Stack.Navigator>
  )
})
