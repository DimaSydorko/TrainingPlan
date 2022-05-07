import * as React from 'react'
import { useEffect } from 'react'
import 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { togglePlaying } from '../store/WorkoutReducer/WorkoutSlice'
import { useAppDispatch, useUser, useWorkout } from '../Hooks/redux'
import AppRouter from './AppRouter'
import { LoginScreen, RegistrationScreen } from '../Screens'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'

export default function AuthRouter() {
  const Stack = createStackNavigator()
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const { user } = useUser()

  useEffect(() => {
    selectedWorkout.isPlaying && dispatch(togglePlaying(false))
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
            <Stack.Screen name={ScreenName.Login} component={LoginScreen} options={theme.screenOptions} />
            <Stack.Screen name={ScreenName.Registration} component={RegistrationScreen} options={theme.screenOptions} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
