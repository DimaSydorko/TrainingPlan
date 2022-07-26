import * as React from 'react'
import { useEffect } from 'react'
import 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import NetInfo from '@react-native-community/netinfo'
import { onInternetConnectionChange } from '../store/SettingsReducer/SettingsSlice'
import { useAppDispatch, useSettings, useUser } from '../Hooks/redux'
import AppRouter from './AppRouter'
import { LoginScreen, RegistrationScreen } from '../Screens'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'
import { colorsFixed } from '../Theme/colors'

export default function AuthRouter() {
  const Stack = createStackNavigator()
  const dispatch = useAppDispatch()
  const { user } = useUser()
  const { colors } = useSettings()

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(onInternetConnectionChange(state.isConnected))
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const options = {
    ...theme.screenOptions,
    headerTintColor: colors.text,
    headerStyle: {
      ...theme.containers.headerStyle,
      backgroundColor: colors.menu,
      shadowColor: colorsFixed.shadow,
    },
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user?.uid ? (
          <Stack.Screen name={ScreenName.App} options={{ headerShown: false }}>
            {() => <AppRouter />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name={ScreenName.Login} component={LoginScreen} options={options} />
            <Stack.Screen name={ScreenName.Registration} component={RegistrationScreen} options={options} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
