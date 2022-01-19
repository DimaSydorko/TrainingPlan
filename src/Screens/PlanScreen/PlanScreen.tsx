import React, {useContext} from "react";
import {useNavigation} from "@react-navigation/native";
import {WorkoutContext} from "../../Providers/WorkoutProvider/WorkoutProvider";
import {ScreenName} from "../../Utils/constants";
import {WorkoutDuration} from "../../Common";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";
import {CardPressed, FlexStart, Page, TextHeader, TextSecondary} from "../../Common/Parents/Parents";

interface PlanScreenType {
  setWorkoutName: (workoutName: string) => void;
}

export default function PlanScreen({setWorkoutName}: PlanScreenType) {
  const {workouts, selectWorkout} = useContext(WorkoutContext)
  const navigation = useNavigation<{ navigate: (name: string) => void }>()

  const onSelect = (workoutUid: string, workoutName: string) => {
    selectWorkout(workoutUid);
    setWorkoutName(workoutName);
    navigation.navigate(ScreenName.Workout);
  }

  return (
    <Page style={theme.margin.top20}>
      {workouts?.map(workout => (
        <CardPressed
          key={workout.uid}
          onPress={() => onSelect(workout.uid, workout.name)}
        >
          <TextHeader color={colors.secondPrimary}>{workout.name}</TextHeader>
          <FlexStart>
            <TextSecondary>{workout.exercises.length} Exercises</TextSecondary>
            <WorkoutDuration exercises={workout.exercises}/>
          </FlexStart>
        </CardPressed>
      ))}
    </Page>
  )
}