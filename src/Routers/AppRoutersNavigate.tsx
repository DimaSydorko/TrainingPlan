import React, {useContext} from 'react'
import {NavigationContainer} from "@react-navigation/native";
import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack'
import { LoginScreen, HomeScreen, RegistrationScreen } from '../Screens'
import {NavigationNavigate} from "../Utils/constants";
import {AuthContext} from "../Providers/AuthProvider/AuthProvider";

const Stack = createStackNavigator();

export default function AppRoutersNavigate() {
  const { user } = useContext(AuthContext)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        { user ? (
          <Stack.Screen name={NavigationNavigate.Home}>
            {() => <HomeScreen extraData={user} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name={NavigationNavigate.Login} component={LoginScreen} />
            <Stack.Screen name={NavigationNavigate.Registration} component={RegistrationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}