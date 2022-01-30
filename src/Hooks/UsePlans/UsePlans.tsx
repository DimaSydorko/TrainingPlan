import {useCallback, useContext, useEffect, useState} from "react";
import {PlanType} from "../../Utils/types";
import firebase from "../../Utils/firebase";
import {AuthContext} from "../../Providers";
import {asyncStorage} from "../../Utils/asyncStarage";
import {AsyncStorageKey, FirebaseDBCollection, QUERY_LIMIT} from "../../Utils/constants";

export default function usePlans() {
  const [plans, setPlans] = useState<PlanType[] | null>(null)
  const {user} = useContext(AuthContext)

  useEffect(() => {
    getPlans().then();
  }, [])

  const getPlans = useCallback(async () => {
    if (user?.data) {
      const data: PlanType[] = [];
      await firebase
        .firestore()
        .collection(FirebaseDBCollection.Plans)
        .where('ownerUid', '==', user?.uid)
        .limit(QUERY_LIMIT)
        .get()
        .then(async (snapshot) => {
          snapshot.docs.forEach(doc => data.push({...doc.data(), uid: doc.id} as PlanType));
          setPlans(data);
          await asyncStorage.set(AsyncStorageKey.Plans, data);
        })
        .catch((error: string) => {
          console.error(error)
        })
    } else {
      const data = await asyncStorage.get(AsyncStorageKey.Plans) as PlanType[];
      setPlans(data)
    }
  }, []);

  const addPlan = useCallback(async (newPlan: PlanType) => {
    if (user?.data) {
     await firebase
        .firestore()
        .collection(FirebaseDBCollection.Plans)
        .add({
          ownerUid: newPlan.ownerUid,
          name: newPlan.name,
          labels: newPlan.labels,
          workoutsCount: newPlan.workoutsCount,
        })
        .then(async (doc) => {
          await getPlans();
        })
        .catch((err) => {
          console.error(err);
        })
    } else {
      console.log(`Didn't created locale storage for save Plans yet`)
    }
  }, [])

  const updatePlan = useCallback(async (newPlan: PlanType) => {
    if (user?.data) {
      await firebase
        .firestore()
        .collection(FirebaseDBCollection.Plans)
        .doc(newPlan.uid)
        .set({
          ownerUid: newPlan.ownerUid,
          name: newPlan.name,
          labels: newPlan.labels,
          workoutsCount: newPlan.workoutsCount,
        })
        .then(async (doc) => {
          await getPlans();
        })
        .catch((err) => {
          console.error(err);
        })
    } else {
      console.log(`Didn't created locale storage for save Plans yet`)
    }
  }, [])

  const deletePlan = useCallback(async (newPlan: PlanType) => {
    if (user?.data) {
      await firebase
        .firestore()
        .collection(FirebaseDBCollection.Plans)
        .doc(newPlan.uid)
        .delete()
        .then(async (doc) => {
          await getPlans();
        })
        .catch((err) => {
          console.error(err);
        })
    } else {
      console.log(`Didn't created locale storage for save Plans yet`)
    }
  }, [])

  return {
    plans,
    addPlan,
    deletePlan,
    updatePlan,
  }
}