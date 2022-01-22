import React, {useState} from "react";
import {
  Card,
  FlexAlignCenter, FlexCenter,
  FlexSpaceBetween,
  FlexStart,
  TextHeader,
  TextSecondary
} from "../../Common/Parents/Parents";
import {secondsToMinSec} from "../../Common/WorkoutDuration/WorkoutDuration";
import {ConfirmButton, IconButton, MyTextInput, SwipeSelector} from "../../Common";
import {ExerciseType} from "../../Utils/types";
import {colors} from "../../Theme/colors";

interface ExerciseEditType {
  exercise: ExerciseType;
}

export default function ExerciseEdit({exercise}: ExerciseEditType) {
  const [isChangeOpened, setIsChangeOpened] = useState(false)
  const [exerciseName, setExerciseName] = useState(exercise.name)
  const [selectSeconds, setSelectSeconds] = useState(0)
  const [selectMinutes, setSelectMinutes] = useState(0)

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
            <IconButton name={'eye-off-outline'} onPress={() => {}}/>
            <IconButton name={'delete-outline'} onPress={() => {}}/>
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
              type={'underline'}
            />
            <FlexCenter>
              <TextHeader color={colors.textSecondary}>
                Break
              </TextHeader>
            </FlexCenter>
            <SwipeSelector onChange={number => setSelectMinutes(number)} maxValue={60}/>
            <FlexCenter>
              <TextSecondary>
                min
              </TextSecondary>
            </FlexCenter>
            <SwipeSelector onChange={number => setSelectSeconds(number)} maxValue={60}/>
            <FlexCenter>
              <TextSecondary>
                sec
              </TextSecondary>
            </FlexCenter>
            <FlexCenter>
              <TextHeader color={colors.textSecondary}>
                Repeats
              </TextHeader>
            </FlexCenter>
            <SwipeSelector onChange={number => setSelectSeconds(number)} maxValue={100}/>
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