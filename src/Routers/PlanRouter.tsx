import React, {useState} from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {ScreenName} from "../Utils/constants";
import {MyPlansScreen, PlanScreen, WorkoutScreen} from "../Screens";
import NotificationHandler from "../Components/NotificationHandler/NotificationHandler";
import {usePlans, useUser, useWorkout} from "../Hooks/redux";
import {theme} from "../Theme/theme";
import {PlanType} from "../Utils/types";
import Loading from "../Common/Loading/Loading";

export default function PlanRouter() {
  const [plan, setPlan] = useState<PlanType | null>(null)
  const Stack = createStackNavigator()
  const workout = useWorkout()
  const plans = usePlans()
  const user = useUser()

  return (
    <>
      <NotificationHandler/>
      {(workout.isLoading || plans.isLoading || user.isLoading) && <Loading/>}
      <Stack.Navigator>
        <Stack.Screen
          name={ScreenName.SavedWorkouts}
          options={{...theme.screenOptions, title: 'All saved Plans'}}
        >
          {() => <MyPlansScreen setPlan={setPlan}/>}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenName.Plan}
          options={{...theme.screenOptions, title: plan?.name}}
        >
          {() => <PlanScreen plan={plan as PlanType}/>}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenName.Workout}
          options={{...theme.screenOptions, title: workout.selectedWorkout?.name}}
        >
          {() => <WorkoutScreen/>}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  )
}
