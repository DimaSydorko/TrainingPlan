import React, {useState} from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {ScreenName} from "../../Utils/constants";
import {MyPlansScreen, PlanScreen, WorkoutScreen} from "../../Screens";
import {theme} from "../../Theme/theme";
import {PlansProvider} from "../../Providers";
import WorkoutProvider from "../../Providers/WorkoutProvider/WorkoutProvider";

export default function PlanRouter() {
  const [planName, setPlaneName] = useState('Plan')
  const [workoutName, setWorkoutName] = useState('Workout')
  const Stack = createStackNavigator();

  return (
    <PlansProvider>
      <WorkoutProvider>
        <Stack.Navigator>
          <Stack.Screen
            name={ScreenName.SavedWorkouts}
            options={{...theme.screenOptions, title: 'All saved Plans'}}
          >
            {() => <MyPlansScreen setPlaneName={setPlaneName}/>}
          </Stack.Screen>
          <Stack.Screen
            name={ScreenName.Plan}
            options={{...theme.screenOptions, title: planName}}
          >
            {() => <PlanScreen setWorkoutName={setWorkoutName}/>}
          </Stack.Screen>
          <Stack.Screen
            name={ScreenName.Workout}
            options={{...theme.screenOptions, title: workoutName}}
          >
            {() => <WorkoutScreen/>}
          </Stack.Screen>
        </Stack.Navigator>
      </WorkoutProvider>
    </PlansProvider>
  )
}