import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {ScreenName} from "../Utils/constants";
import {theme} from "../Theme/theme";
import {MyWorkoutsScreen} from "../Screens";

export default function WorkoutsRouter() {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ScreenName.SavedPlans}
        options={{...theme.screenOptions, title: 'All saved Workouts'}}
      >
        {() => <MyWorkoutsScreen/>}
      </Stack.Screen>
    </Stack.Navigator>
  )
}