import React, {useState} from "react";
import {
  Card,
  FlexAlignCenter,
  FlexSpaceBetween,
  FlexStart,
  TextHeader,
  TextSecondary
} from "../../Common/Parents/Parents";
import {secondsToMinSec} from "../../Common/WorkoutDuration/WorkoutDuration";
import IconButton from "../../Common/IconButton/IconButton";
import {ConfirmButton, MyTextInput} from "../../Common";
import {screen} from "../../Utils/constants";
import {ExerciseType} from "../../Utils/types";
import {colors} from "../../Theme/colors";

interface ExerciseEditType {
  exercise: ExerciseType;
}

export default function ExerciseEdit({exercise}: ExerciseEditType) {
  const [isChangeOpened, setIsChangeOpened] = useState(false)
  const [exerciseName, setExerciseName] = useState(exercise.name)

  return (
    <Card>
      {!isChangeOpened ? (
        <>
        <FlexSpaceBetween>
          <TextHeader color={colors.secondPrimary}>
            {exercise.name}
          </TextHeader>
          <FlexStart>
            <IconButton name={'pencil-outline'} onPress={() => setIsChangeOpened(true)}/>
            <IconButton name={'delete-outline'} onPress={() => {
            }}/>
          </FlexStart>
        </FlexSpaceBetween>
        <FlexSpaceBetween>
        <TextSecondary>
      {exercise.approaches.length} laps {exercise.repeats} rep {exercise.approaches[0].weight} kg
        </TextSecondary>
        <TextSecondary>
        Break: {secondsToMinSec(exercise.breakTimeInSec)}
        </TextSecondary>
        </FlexSpaceBetween>
        </>
        ) : (
          <>
            <MyTextInput
              placeholder={'Exercise name'}
              onChangeText={name => setExerciseName(name)}
              value={exerciseName}
              style={{width: screen.vw - 60}}
            />
            <FlexAlignCenter>
              <ConfirmButton header={'Save'} onPress={() => {}}/>
              <ConfirmButton
                header={'Cancel'}
                color={colors.textSecondary}
                onPress={() => setIsChangeOpened(false)}
              />
            </FlexAlignCenter>
          </>
        )}
    </Card>
  )
}