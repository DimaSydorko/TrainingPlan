import {useEffect, useState} from "react";
import {PlanType} from "../../Utils/types";

const myPlansInitial = [
  {
    uid: 'Plan_Uid_1',
    name: 'Initial Plan 1',
    workoutUIDs: ['Workout_Uid_1', 'Workout_Uid_2'],
  }, {
    uid: 'Plan_Uid_2',
    name: 'Initial Plan 2',
    workoutUIDs: ['Workout_Uid_1', 'Workout_Uid_2'],
  }
] as PlanType[]

export default function usePlans() {
  const [plans, setPlans] = useState<PlanType[] | null>(null)

  useEffect(() => {
    setPlans(myPlansInitial)
  }, [])

  return {
    plans
  }
}