
import registerRootComponent from 'expo/build/launch/registerRootComponent';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { LoginScreen, HomeScreen, RegistrationScreen } from './Screens'
import {decode, encode} from 'base-64'
import {NavigationNavigate} from "./Utils/constants";
import {UserType} from "./Utils/types";
if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator();

function App() {

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserType | null>({
    email: 'sidorko25@gmail.com',
    uid: 'qD690ojqm6PD4xsFszXSz7Fz8q82',
    name: 'DimaSydorko'
  }) //TODO set null

  return (
    <NavigationContainer>
      <Stack.Navigator>
        { user ? (
          <Stack.Screen name={NavigationNavigate.Home}>
            {props => <HomeScreen {...props} extraData={user} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name={NavigationNavigate.Login} component={LoginScreen} />
            <Stack.Screen name={NavigationNavigate.Registration} component={RegistrationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);