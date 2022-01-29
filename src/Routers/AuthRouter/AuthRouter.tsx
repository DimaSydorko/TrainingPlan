import React, {useContext} from 'react'
import 'react-native-gesture-handler';
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from '@react-navigation/stack'
import {LoginScreen, RegistrationScreen} from '../../Screens'
import {ScreenName} from "../../Utils/constants";
import {theme} from "../../Theme/theme";
import {AuthContext} from "../../Providers";
import {TextHeader} from "../../Theme/Parents";
import AppRouter from "../AppRouter/AppRouter";


export default function AuthRouter() {
  const Stack = createStackNavigator();
  const {user, isLoading} = useContext(AuthContext)

  return isLoading ? (
    <TextHeader>Loading...</TextHeader>
  ) : (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen
            name={ScreenName.App}
            options={{headerShown: false}}
          >
            {() => <AppRouter/>}
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