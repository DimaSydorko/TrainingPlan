import { createAsyncThunk } from '@reduxjs/toolkit'
import { FB_Collection_Publications, FB_FieldValue } from '../../Utils/firebase'
import { QUERY_LIMIT } from '../../Utils/constants'
import { ApproachType, ExerciseType, PlanType, PublicType, WorkoutType } from '../../Utils/types'
import { RootState } from '../index'
import { getCurrentTime, nanoid } from '../../Utils'
import { workoutAC } from '../WorkoutReducer/WorkoutActionCreators'
import { plansAC } from '../PlansReducer/PlansAC'

type AddType = (PlanType | WorkoutType) & {
  exercises?: ExerciseType[]
  workoutUids?: string[]
}

export interface LikeToggleType {
  publicationUid: string
  isLiked: boolean
}

export interface getType {
  isYours?: boolean
}

export const publicationsAC = {
  get: createAsyncThunk('publications/get', async ({ isYours = false }: getType, thunkAPI) => {
    const { userReducer } = thunkAPI.getState() as RootState
    const userUid: string = userReducer.user.uid
    try {
      const snapshot = isYours
        ? await FB_Collection_Publications.where('ownerUid', '==', userUid).limit(QUERY_LIMIT).get()
        : await FB_Collection_Publications.limit(QUERY_LIMIT).get()
      const publications: PublicType[] = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as PublicType))
      return { publications, isYours }
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  add: createAsyncThunk('publications/add', async (publication: AddType, thunkAPI) => {
    const {
      userReducer: { user },
      workoutReducer: { workouts },
    } = thunkAPI.getState() as RootState

    try {
      const planWorkouts: Omit<WorkoutType, 'plansUid'>[] = []
      if (publication?.workoutUids) {
        publication?.workoutUids.forEach(WUid => planWorkouts.push(workouts.find(w => w.uid === WUid)))
      }

      const { uid, ...newPublication }: PublicType = {
        ...(publication?.exercises ? { exercises: publication.exercises } : {}),
        ...(publication?.workoutUids ? { workouts: planWorkouts } : {}),
        uid: nanoid(),
        name: publication.name,
        lastUpdated: getCurrentTime(),
        labels: publication.labels,
        ownerUid: user.uid,
        downloads: [],
        likes: [],
        ownerName: user.displayName,
      } as PublicType
      await FB_Collection_Publications.doc(uid).set(newPublication)
      return { uid, ...newPublication }
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  likeToggle: createAsyncThunk(
    'publications/likeToggle',
    async ({ isLiked, publicationUid }: LikeToggleType, thunkAPI) => {
      const { userReducer } = thunkAPI.getState() as RootState
      const userUid: string = userReducer.user.uid
      try {
        await FB_Collection_Publications.doc(publicationUid).update({
          likes: isLiked ? FB_FieldValue.arrayRemove(userUid) : FB_FieldValue.arrayUnion(userUid),
        })
        return { isLiked, publicationUid, userUid }
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  save: createAsyncThunk('publications/save', async (publication: PublicType, thunkAPI) => {
    const { userReducer } = thunkAPI.getState() as RootState
    const ownerUid: string = userReducer.user.uid
    try {
      if (publication?.exercises) {
        const { ownerName, downloads, likes, workouts, ...workout } = publication
        const newWorkout: WorkoutType = {
          ...workout,
          uid: nanoid(),
          ownerUid,
          exercises: workout.exercises.map(ex => ({
            ...ex,
            approaches: ex.approaches.map(() => ({ repeats: 0, weight: 0 } as ApproachType)),
          })),
          plansUid: [],
        }
        thunkAPI.dispatch(workoutAC.addWorkout({ workout: newWorkout }))
      } else {
        const { ownerName, downloads, likes, exercises, workouts, ...plan } = publication
        const newPlan: PlanType = {
          ...plan,
          uid: nanoid(),
          ownerUid,
          workoutUids: [],
        }

        newPlan.workoutUids = workouts.map(workout => {
          const newWorkout: WorkoutType = {
            ...workout,
            uid: nanoid(),
            ownerUid,
            exercises: workout.exercises.map(ex => ({
              ...ex,
              approaches: ex.approaches.map(() => ({ repeats: 0, weight: 0 } as ApproachType)),
            })),
            plansUid: [newPlan.uid],
          }

          thunkAPI.dispatch(workoutAC.addWorkout({ workout: newWorkout, isSetInPlan: false }))
          return newWorkout.uid
        })
        thunkAPI.dispatch(plansAC.addPlan(newPlan))
      }
      if (!publication.downloads.includes(ownerUid)) {
        await FB_Collection_Publications.doc(publication.uid).update({
          downloads: FB_FieldValue.arrayUnion(ownerUid),
        })
        return { publicationUid: publication.uid, userUid: ownerUid }
      }
      return null
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  delete: createAsyncThunk('publications/delete', async (publication: PublicType, thunkAPI) => {
    const { userReducer } = thunkAPI.getState() as RootState
    const ownerUid: string = userReducer.user.uid
    try {
      if (publication.ownerUid === ownerUid) {
        await FB_Collection_Publications.doc(publication.uid).delete()
        return publication.uid
      }
      return thunkAPI.rejectWithValue("You can't delete this")
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
}
