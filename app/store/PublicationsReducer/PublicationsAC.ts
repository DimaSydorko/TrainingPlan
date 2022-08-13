import { createAsyncThunk } from '@reduxjs/toolkit'
import { QUERY_LIMIT } from '../../Utils/constants'
import { getCurrentTime, nanoid } from '../../Utils'
import { FB_Collection_Publications, FB_FieldValue } from '../../Utils/firebase'
import { ApproachType, ExerciseType, PlanType, PublicType, WorkoutType } from '../../Utils/types'
import { RootState } from '../index'
import { workoutAC } from '../WorkoutReducer/WorkoutAC'
import { plansAC } from '../PlansReducer/PlansAC'

type AddType = (PlanType | WorkoutType) & {
  workouts?: WorkoutType[]
  exercises?: ExerciseType[]
}
export interface LikeToggleType {
  publicationUid: string
  isLiked: boolean
}

export interface getType {
  isYours?: boolean
  labels?: string[]
}

export const publicationsAC = {
  get: createAsyncThunk('publications/get', async ({ isYours = false, labels = [] }: getType, thunkAPI) => {
    const { userReducer } = thunkAPI.getState() as RootState
    const userUid: string = userReducer.user.uid

    try {
      const snapshot = isYours
        ? await FB_Collection_Publications.where('ownerUid', '==', userUid).limit(QUERY_LIMIT).get()
        : labels.length && labels[0]
        ? await FB_Collection_Publications.where('labels', 'array-contains-any', labels).limit(QUERY_LIMIT).get()
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
    } = thunkAPI.getState() as RootState

    try {
      const { uid, ...newPublication }: PublicType = {
        ...(publication?.exercises ? { exercises: publication.exercises } : {}),
        ...(publication?.workouts ? { workouts: publication.workouts } : {}),
        uid: nanoid(),
        name: publication.name,
        lastUpdated: getCurrentTime(),
        labels: publication.labels,
        colorIdx: publication.colorIdx,
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
        FB_Collection_Publications.doc(publicationUid).update({
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
        }
        thunkAPI.dispatch(workoutAC.addWorkout(newWorkout))
      } else {
        const { ownerName, downloads, likes, exercises, workouts, ...plan } = publication
        const newPlan: PlanType = {
          ...plan,
          uid: nanoid(),
          ownerUid,
          workouts,
        }

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
