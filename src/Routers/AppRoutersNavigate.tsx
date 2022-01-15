import React, {useContext} from 'react'
import 'react-native-gesture-handler';
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator, StackNavigationOptions} from '@react-navigation/stack'
import { LoginScreen, HomeScreen, RegistrationScreen } from '../Screens'
import {ScreenName} from "../Utils/constants";
import {AuthContext} from "../Providers/AuthProvider/AuthProvider";
import {theme} from "../Theme/theme";

const Stack = createStackNavigator();

export default function AppRoutersNavigate() {
  const { user } = useContext(AuthContext)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        { user ? (
          <Stack.Screen name={ScreenName.Home} options={() => theme.stackScreenOptions() as StackNavigationOptions}>
            {() => <HomeScreen/>}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name={ScreenName.Login}
              component={LoginScreen}
              options={() => theme.stackScreenOptions() as StackNavigationOptions}
            />
            <Stack.Screen
              name={ScreenName.Registration}
              component={RegistrationScreen}
              options={() => theme.stackScreenOptions() as StackNavigationOptions}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}