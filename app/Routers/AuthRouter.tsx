import * as React from 'react'
import { useEffect } from 'react'
import 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { togglePlaying } from '../store/WorkoutReducer/WorkoutSlice'
import { useAppDispatch, useSettings, useUser, useWorkout } from '../Hooks/redux'
import AppRouter from './AppRouter'
import { LoginScreen, RegistrationScreen } from '../Screens'
import { ScreenName } from '../Utils/constants'
import { theme } from '../Theme/theme'
import { colorsFixed } from '../Theme/colors'

export default function AuthRouter() {
  const Stack = createStackNavigator()
  const dispatch = useAppDispatch()
  const { selectedWorkout } = useWorkout()
  const { user } = useUser()
  const { colors } = useSettings()

  useEffect(() => {
    selectedWorkout?.isPlaying && dispatch(togglePlaying(false))
  }, [])

  const options = {
    ...theme.screenOptions,
    headerTintColor: colors.text,
    headerStyle: {
      ...theme.containers.headerStyle,
      backgroundColor: colors.menu,
      shadowColor: colorsFixed.shadow
    }
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
