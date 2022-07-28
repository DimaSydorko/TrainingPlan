import * as React from 'react'
import { useEffect } from 'react'
import 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import NetInfo from '@react-native-community/netinfo'
import { onInternetConnectionChange } from '../store/SettingsReducer/SettingsSlice'
import { useAppDispatch, useUser } from '../Hooks/redux'
import AppRouter from './AppRouter'
import { LoginScreen, RegistrationScreen } from '../Screens'
import { useScreenOptions } from '../Theme/Parents'
import { ScreenName } from '../Utils/constants'

export default function AuthRouter() {
  const Stack = createStackNavigator()
  const options = useScreenOptions()
  const dispatch = useAppDispatch()
  const { user } = useUser()

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(onInternetConnectionChange(state.isConnected))
    })
    return () => unsubscribe()
  }, [])

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
