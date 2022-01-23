import React, {useContext, useState} from "react";
import {WorkoutContext} from "../../Providers/WorkoutProvider/WorkoutProvider";
import {secondsToMinSec} from "../../Common/WorkoutDuration/WorkoutDuration";
import {Card, FlexSpaceBetween, FlexStart, Page, TextHeader, TextSecondary} from "../../Theme/Parents";
import {AddMoreButton, MySwitch, MyTextInput, WorkoutDuration} from "../../Common";
import ExerciseEdit from "../../Components/ExerciseEdit/ExerciseEdit";
import ExerciseResult from "../../Components/ExerciseResults/ExerciseResult";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";

export default function WorkoutScreen() {
  const {selectedWorkout} = useContext(WorkoutContext)
  const [isEditMode, setIsEditMode] = useState(false)
  const [workoutNameInput, setWorkoutNameInput] = useState<string>(selectedWorkout?.name || '')
  const [workoutLabels, setWorkoutLabels] = useState('')

  return selectedWorkout ? (
    <Page>
      <FlexSpaceBetween style={theme.containers.secondHeader}>
        <WorkoutDuration exercises={selectedWorkout?.exercises}/>
        <FlexStart>
          <TextSecondary style={{width: 80}}>
            Edit Mode:
          </TextSecondary>
          <MySwitch value={isEditMode} onValueChange={() => setIsEditMode(b => !b)}/>
        </FlexStart>
      </FlexSpaceBetween>
      {isEditMode ? (
        <>
          <MyTextInput
            placeholder={'Workout Name'}
            onChangeText={workoutName => setWorkoutNameInput(workoutName)}
            value={workoutNameInput}
            type={'underline'}
          />
          <MyTextInput
            placeholder={'Labels:  #...'}
            onChangeText={labels => setWorkoutLabels(labels)}
            value={workoutLabels}
            type={'secondary'}
          />
          {selectedWorkout.exercises.map(exercise => (
            <ExerciseEdit
              key={`${exercise.name}_${exercise.breakTimeInSec}_${exercise.repeats}`}
              exercise={exercise}
            />
          ))}
          <AddMoreButton onPress={() => {}} header={'Exercise'}/>
        </>
      ) : selectedWorkout.exercises.map(exercise => (
        <Card key={`${exercise.name}_${exercise.breakTimeInSec}_${exercise.repeats}`}>
          <FlexSpaceBetween>
            <TextHeader color={colors.secondPrimary}>
              {exercise.name}
            </TextHeader>
            <TextSecondary>
              Break: {secondsToMinSec(exercise.breakTimeInSec)}
            </TextSecondary>
          </FlexSpaceBetween>
          {exercise.approaches.map((approach, idx) => (
            <ExerciseResult
              key={idx}
              isPrevious
              weight={approach.weight}
              repeats={approach.repeats}
            />
          ))}
        </Card>
      ))}
    </Page>
  ) : (
    <Page>
      <TextSecondary>
        Error try reload page
      </TextSecondary>
    </Page>
  )
}