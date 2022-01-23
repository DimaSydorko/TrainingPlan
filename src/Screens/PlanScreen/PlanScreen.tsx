import React, {useContext, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {View} from "react-native";
import {WorkoutContext} from "../../Providers/WorkoutProvider/WorkoutProvider";
import {ScreenName} from "../../Utils/constants";
import {CardPressed, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary} from "../../Theme/Parents";
import {AddMoreButton, MySwitch, WorkoutDuration} from "../../Common";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";

interface PlanScreenType {
  setWorkoutName: (workoutName: string) => void;
}

export default function PlanScreen({setWorkoutName}: PlanScreenType) {
  const {workouts, selectWorkout} = useContext(WorkoutContext)
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const [isEditMode, setIsEditMode] = useState(false)

  const onSelect = (workoutUid: string, workoutName: string) => {
    selectWorkout(workoutUid);
    setWorkoutName(workoutName);
    navigation.navigate(ScreenName.Workout);
  }

  return (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <View/>
        <FlexStart>
          <TextSecondary style={{width: 80}}>
            Edit Mode:
          </TextSecondary>
          <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)}/>
        </FlexStart>
      </FlexSpaceBetween>
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
      {isEditMode && <AddMoreButton onPress={() => {}} header={'Workout'}/>}
    </Page>
  )
}