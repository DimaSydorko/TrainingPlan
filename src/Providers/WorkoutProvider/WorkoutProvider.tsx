import {createContext} from "react";
import firebase from "../../Utils/firebase";
import {ProviderProps} from "../index";
import useAuth from "../../Hooks/UseAuth/UseAuth";
import {PlanType, WorkoutType} from "../../Utils/types";
import usePlans from "../../Hooks/UsePlans/UsePlans";
import useWorkout from "../../Hooks/UseWorkouts/UseWorkout";

interface WorkoutContextType {
  selectWorkout: (workoutUid: string) => void;
  selectedWorkout: WorkoutType | null;
  workouts: WorkoutType[] | null
}

export const WorkoutContext = createContext<WorkoutContextType>(null!);

export default function WorkoutProvider({children}: ProviderProps) {
  const {
    selectWorkout,
    selectedWorkout,
    workouts,
  } = useWorkout()

  return (
    <WorkoutContext.Provider value={{
      selectWorkout,
      selectedWorkout,
      workouts,
    }}>
      {children}
    </WorkoutContext.Provider>
  )
}