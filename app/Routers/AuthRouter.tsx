import * as React from 'react'
import 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useUser } from '../Hooks/redux'
import AppRouter from './AppRouter'
import { LoginScreen, RegistrationScreen } from '../Screens'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'

export default function AuthRouter() {
  const Stack = createStackNavigator()
  const { user } = useUser()

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user?.uid ? (
          <Stack.Screen
            name={ScreenName.App}
            options={{ headerShown: false }}
          >
            {() => <AppRouter />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name={ScreenName.Login}
              component={LoginScreen}
              options={theme.screenOptions}
            />
            <Stack.Screen
              name={ScreenName.Registration}
              component={RegistrationScreen}
              options={theme.screenOptions}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}