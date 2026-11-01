import * as React from 'react'
import { useEffect, useMemo } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import NetInfo from '@react-native-community/netinfo'
import useAuthSessionListener from '@services/auth/use-auth-session-listener'
import { useSessionStore } from '@stores/session/use-session-store'
import { SESSION_STATUS } from '@stores/session/session.constants'
import { useAppTheme } from '@theme/use-app-theme'
import { useNetworkStore } from '@stores/network/use-network-store'
import AppRouter from './app-router'
import { LoginScreen, RegistrationScreen } from '@screens'
import { buildNavigationTheme, useScreenOptions } from '@theme/navigation-theme'
import { ScreenName } from '@utils/constants'
import { AuthStackParamList } from '@utils/types'

// React Navigation 7 types need an explicit navigator `id` because tsconfig has `strict: false`
// (its optional-`id` overload only type-checks under strictNullChecks).
// Navigators are created once at module level. Creating them inside the component (as before)
// made a new navigator type on every render, which remounted the whole stack.
const Stack = createStackNavigator<AuthStackParamList, 'AuthStack'>()

export default function AuthRouter() {
  const options = useScreenOptions()
  const sessionStatus = useSessionStore(state => state.status)
  const setSession = useSessionStore(state => state.setSession)
  const appTheme = useAppTheme()
  const setIsOnline = useNetworkStore(state => state.setIsOnline)
  const navigationTheme = useMemo(() => buildNavigationTheme(appTheme), [appTheme])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected)
    })
    return () => unsubscribe()
  }, [setIsOnline])

  useAuthSessionListener(setSession)

  if (sessionStatus === SESSION_STATUS.LOADING) return null

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator id='AuthStack'>
        {sessionStatus === SESSION_STATUS.SIGNED_IN ? (
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
