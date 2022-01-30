import {useCallback, useContext, useEffect, useState} from "react";
import {PlanType, WorkoutPlanType} from "../../Utils/types";
import firebase from "../../Utils/firebase";
import {AsyncStorageKey, FirebaseDBCollection, QUERY_LIMIT} from "../../Utils/constants";
import {asyncStorage} from "../../Utils/asyncStarage";
import {AuthContext, PlansContext} from "../../Providers";

export default function useWorkout() {
  const {user} = useContext(AuthContext)
  const {updatePlan} = useContext(PlansContext)

  const [workouts, setWorkouts] = useState<WorkoutPlanType[] | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlanType | null>(null)

  useEffect(() => {
    console.log('selectedWorkout', selectedWorkout?.uid)
  },[selectedWorkout])

  console.log('useWorkout', selectedWorkout?.name)

  const getWorkouts = useCallback(async (planUid: string) => {
    if (user?.data) {
      const data: WorkoutPlanType[] = [];
      await firebase
        .firestore()
        .collection(FirebaseDBCollection.Workouts)
        .where('planUid', '==', planUid)
        .limit(QUERY_LIMIT)
        .get()
        .then(async (snapshot) => {
          snapshot.docs.forEach(doc => data.push({...doc.data(), uid: doc.id} as WorkoutPlanType));
          setWorkouts(data);
          await asyncStorage.set(AsyncStorageKey.Workouts, data);
        })
        .catch((error: string) => {
          console.error(error)
        })
    } else {
      const data = await asyncStorage.get(AsyncStorageKey.Workouts) as WorkoutPlanType[];
      setWorkouts(data)
    }
  }, []);

  const addWorkout = useCallback(async (newWorkout: WorkoutPlanType, plan: PlanType) => {
    if (user?.data) {
      await firebase
        .firestore()
        .collection(FirebaseDBCollection.Workouts)
        .add({
          ownerUid: newWorkout.ownerUid,
          planUid: newWorkout.planUid,
          name: newWorkout.name,
          labels: newWorkout.labels,
          exercises: newWorkout.exercises,
        })
        .then(async (doc) => {
          await Promise.all([
            updatePlan({...plan, workoutsCount: plan.workoutsCount + 1}),
            getWorkouts(newWorkout.planUid)
          ])
        })
        .catch((err) => {
          console.error(err);
        })
    } else {
      console.log(`Didn't created locale storage for save PlansWorkout yet`)
    }
  }, []);

  const updateWorkout = useCallback(async (newWorkout: WorkoutPlanType) => {
    if (user?.data) {
      await firebase
        .firestore()
        .collection(FirebaseDBCollection.Workouts)
        .doc(newWorkout.uid)
        .update({
          ownerUid: newWorkout.ownerUid,
          planUid: newWorkout.planUid,
          name: newWorkout.name,
          labels: newWorkout.labels,
          exercises: newWorkout.exercises,
        })
        .then(async () => {
          await getWorkouts(newWorkout.planUid)
          console.log('1', selectedWorkout?.uid, newWorkout.uid)
          if (selectedWorkout?.uid == newWorkout.uid) {
            console.log('2')
            selectWorkout(newWorkout.uid);
            console.log('3')
          }
        })
        .catch((err) => {
          console.error(err);
        })
    } else {
      console.log(`Didn't created locale storage for save PlansWorkout yet`)
    }
  }, [])

  const deleteWorkout = useCallback(async (workoutUid: string, plan: PlanType) => {
    if (user?.data) {
      await firebase
        .firestore()
        .collection(FirebaseDBCollection.Workouts)
        .doc(workoutUid)
        .delete()
        .then(async () => {
          await Promise.all([
            updatePlan({...plan, workoutsCount: plan.workoutsCount - 1}),
            getWorkouts(plan.uid)
          ])
        })
        .catch((err) => {
          console.error(err);
        })
    } else {
      console.log(`Didn't created locale storage for save PlansWorkout yet`)
    }
  }, [])

  const selectWorkout = useCallback((workoutUid: string) => {
    setSelectedWorkout(workouts?.find(workout => workout.uid === workoutUid) || null)
  }, [workouts])

  return {
    workouts,
    getWorkouts,
    selectedWorkout,
    selectWorkout,
    addWorkout,
    updateWorkout,
    deleteWorkout,
  }
}