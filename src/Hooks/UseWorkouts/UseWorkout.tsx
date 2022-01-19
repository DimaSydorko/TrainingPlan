import {useCallback, useEffect, useState} from "react";
import {WorkoutType} from "../../Utils/types";

const myWorkoutsInitial = [
  {
    uid: 'Workout_Uid_1',
    name: 'Initial Workout 1',
    exercises: [
      {
        name: 'Initial exercise 1',
        breakTimeInSec: 60,
        repeats: 12,
        currentRepeats: [12, 10, 8],
        weight: 10,
        laps: 3,
      }, {
        name: 'Initial exercise 2',
        breakTimeInSec: 30,
        repeats: 12,
        currentRepeats: [20, 18, 16],
        weight: 0,
        laps: 4,
      }
    ],
  }, {
    uid: 'Workout_Uid_2',
    name: 'Initial Workout 2',
    exercises: [
      {
        name: 'Initial exercise 1',
        breakTimeInSec: 60,
        repeats: 12,
        currentRepeats: [12, 10, 8],
        weight: 10,
        laps: 3,
      }
    ],
  }
] as WorkoutType[]

export default function useWorkout() {
  const [workouts, setWorkouts] = useState<WorkoutType[] | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null)

  useEffect(() => {
    setWorkouts(myWorkoutsInitial)
  }, [])

  const selectWorkout = useCallback((workoutUid: string) => {
    setSelectedWorkout(workouts?.find(workout => workout.uid === workoutUid) || null)
  }, [workouts])

  return {
    workouts,
    selectedWorkout,
    selectWorkout
  }
}