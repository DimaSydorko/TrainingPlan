import {createContext} from "react";
import {ProviderProps} from "../index";
import {PlanType, WorkoutPlanType, WorkoutType} from "../../Utils/types";
import useWorkout from "../../Hooks/UseWorkouts/UseWorkout";

interface WorkoutContextType {
  selectWorkout: (workoutUid: string) => void;
  selectedWorkout: WorkoutPlanType | null;
  workouts: WorkoutPlanType[] | null;
  getWorkouts: (planUid: string) => Promise<void>;
  addWorkout: (workout: WorkoutPlanType, plan: PlanType) => Promise<void>;
  updateWorkout: (workout: WorkoutPlanType) => Promise<void>;
  deleteWorkout: (workoutUid: string, plan: PlanType) => Promise<void>;
}

export const WorkoutContext = createContext<WorkoutContextType>(null!);

export default function WorkoutProvider({children}: ProviderProps) {
  const {
    selectWorkout,
    selectedWorkout,
    workouts,
    getWorkouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
  } = useWorkout()

  return (
    <WorkoutContext.Provider value={{
      selectWorkout,
      selectedWorkout,
      workouts,
      getWorkouts,
      addWorkout,
      updateWorkout,
      deleteWorkout,
    }}>
      {children}
    </WorkoutContext.Provider>
  )
}