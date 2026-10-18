import * as React from 'react'
import { useEffect, useMemo } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import NetInfo from '@react-native-community/netinfo'
import { onInternetConnectionChange } from '@store/settings-reducer/settings-slice'
import { useAppDispatch, useSettings, useUser } from '@hooks/redux'
import AppRouter from './app-router'
import { LoginScreen, RegistrationScreen } from '@screens'
import { useScreenOptions } from '@theme/parents'
import { buildNavigationTheme } from '@theme/navigation-theme'
import { ScreenName } from '@utils/constants'
import { AuthStackParamList } from '@utils/types'

// React Navigation 7 types need an explicit navigator `id` because tsconfig has `strict: false`
// (its optional-`id` overload only type-checks under strictNullChecks).
// Navigators are created once at module level. Creating them inside the component (as before)
// made a new navigator type on every render, which remounted the whole stack.
const Stack = createStackNavigator<AuthStackParamList, 'AuthStack'>()

export default function AuthRouter() {
  const options = useScreenOptions()
  const dispatch = useAppDispatch()
  const { user } = useUser()
  const { colors } = useSettings()
  const navigationTheme = useMemo(() => buildNavigationTheme(colors), [colors])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(onInternetConnectionChange(!!state.isConnected))
    })
    return () => unsubscribe()
  }, [])

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator id='AuthStack'>
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
