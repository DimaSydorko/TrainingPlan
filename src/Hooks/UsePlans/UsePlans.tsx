import {useEffect, useState} from "react";
import {PlanType} from "../../Utils/types";
import firebase from "../../Utils/firebase";
import {asyncStorage} from "../../Utils/asyncStarage";
import {AsyncStorageKey, FirebaseDBCollection} from "../../Utils/constants";

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

  const getPlans = () => {
    firebase
      .firestore()
      .collection(FirebaseDBCollection.Plans)
      .doc()
      .get()
      .then((response) => {

      })
      .catch((error: string) => {
        alert(error)
      });
  }

  return {
    plans
  }
}