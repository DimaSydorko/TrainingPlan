import React, {useContext} from "react";
import {WorkoutContext} from "../../Providers/WorkoutProvider/WorkoutProvider";
import {secondsToMinSec} from "../../Common/WorkoutDuration/WorkoutDuration";
import {Card, FlexSpaceBetween, Page, TextHeader, TextSecondary} from "../../Common/Parents/Parents";
import {WorkoutDuration} from "../../Common";
import {colors} from "../../Theme/colors";

export default function WorkoutScreen() {
  const {selectedWorkout} = useContext(WorkoutContext)

  return selectedWorkout ? (
    <Page>
      <FlexSpaceBetween>
        <WorkoutDuration exercises={selectedWorkout?.exercises}/>
      </FlexSpaceBetween>
      {selectedWorkout.exercises.map(exercise => (
        <Card key={`${exercise.name}_${exercise.breakTimeInSec}_${exercise.repeats}`}>
          <TextHeader color={colors.secondPrimary}>
            {exercise.name}
          </TextHeader>
          <FlexSpaceBetween>
            <TextSecondary>
              {exercise.laps} laps {exercise.repeats} rep {exercise.weight} kg
            </TextSecondary>
            <TextSecondary>
              Break: {secondsToMinSec(exercise.breakTimeInSec)}
            </TextSecondary>
          </FlexSpaceBetween>
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