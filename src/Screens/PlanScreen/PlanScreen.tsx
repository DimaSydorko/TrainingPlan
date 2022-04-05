import React, {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {View} from "react-native";
import {useAppDispatch, useUser, useWorkout} from "../../Hooks/redux";
import {ScreenName} from "../../Utils/constants";
import {selectWorkout} from "../../store/WorkoutReducer/WorkoutSlice";
import {workoutActionCreators} from "../../store/WorkoutReducer/WorkoutActionCreators";
import {CardPressed, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary} from "../../Theme/Parents";
import {AddMoreButton, IconButton, MySwitch, WorkoutDuration} from "../../Common";
import {PlanType, WorkoutPlanType} from "../../Utils/types";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";
import {icon} from "../../Theme/icons";

interface PlanScreenType {
  plan: PlanType;
}

export default function PlanScreen({plan}: PlanScreenType) {
  const dispatch = useAppDispatch()
  const {workouts} = useWorkout()
  const {user} = useUser();
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const [isEditMode, setIsEditMode] = useState(false)

  const onSelect = (workout: WorkoutPlanType) => {
    dispatch(selectWorkout(workout.uid))
    navigation.navigate(ScreenName.Workout);
  }

  const onAddWorkout = () => {
    if (!user) return
    dispatch(workoutActionCreators.addWorkout({
      uid: '',
      planUid: plan.uid,
      name: 'Test workout',
      ownerUid: user.uid,
      labels: [],
      exercises: [],
      userUid: user.uid,
      workoutsCount: workouts.length,
    }))
  }

  const onDeleteWorkout = (workoutUid: string) => {
    if (!user) return
    dispatch(workoutActionCreators.deleteWorkout({workoutUid, ...plan, userUid: user.uid}))
  }

  return (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <View/>
        {workouts?.length ? (
          <FlexStart>
            <TextSecondary style={{width: 80}}>
              Edit Mode:
            </TextSecondary>
            <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)}/>
          </FlexStart>
        ) : null}
      </FlexSpaceBetween>
      {workouts?.map(workout => (
        <CardPressed key={workout.uid} onPress={() => onSelect(workout)}>
          <FlexSpaceBetween>
            <View>
              <TextHeader color={colors.secondPrimary}>{workout.name}</TextHeader>
              <FlexStart>
                <TextSecondary>{workout.exercises.length} Exercises</TextSecondary>
                <WorkoutDuration exercises={workout.exercises}/>
              </FlexStart>
            </View>
            {isEditMode && <IconButton iconName={icon.delete} onPress={() => onDeleteWorkout(workout.uid)}/>}
          </FlexSpaceBetween>
        </CardPressed>
      ))}
      {(isEditMode || !workouts?.length) && <AddMoreButton onPress={onAddWorkout} header={'Workout'}/>}
    </Page>
  )
}