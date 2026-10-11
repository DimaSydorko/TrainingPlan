import { createAsyncThunk } from '@reduxjs/toolkit'
import { getCurrentTime, nanoid } from '../../Utils'
import { arrayRemove, arrayUnion, deleteDoc, doc, getDocs, query, setDoc, updateDoc } from 'firebase/firestore'
import { publicationsCollection } from '../../Utils/firebase'
import { ApproachType, ExerciseType, PlanType, PublicType, WorkoutType } from '../../Utils/types'
import type { RootState } from '../index'
import { workoutAC } from '../WorkoutReducer/WorkoutAC'
import { plansAC } from '../PlansReducer/PlansAC'
import { errorMessage } from '../sync'
import { buildPublicationsQuery } from './publicationsQuery'

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
  lastVisible?: PublicType
  firstVisible?: PublicType
}

export const publicationsAC = {
  get: createAsyncThunk(
    'publications/get',
    async ({ isYours = false, labels = [], lastVisible, firstVisible }: getType, thunkAPI) => {
      const { userReducer, publicationsReducer } = thunkAPI.getState() as RootState
      const userUid: string = userReducer.user.uid
      const isPublicationsAll: boolean = publicationsReducer.isPublicationsAll
      const isUserPublicationsAll: boolean = publicationsReducer.isUserPublicationsAll
      const isNextChunk = !!lastVisible

      try {
        //check if all data loaded
        if (isPublicationsAll && !isYours && !!lastVisible) return { publications: [], isYours, isNextChunk: true }
        else if (isUserPublicationsAll && isYours && !!firstVisible)
          return { publications: [], isYours, isNextChunk: true }

        const snapshot = await getDocs(
          query(
            publicationsCollection,
            ...buildPublicationsQuery({ isYours, labels, lastVisible, firstVisible, userUid })
          )
        )

        const publications: PublicType[] = snapshot.docs.map(
          d =>
            ({
              ...d.data(),
              uid: d.id,
            } as PublicType)
        )
        return { publications, isYours, isNextChunk }
      } catch (e) {
        return thunkAPI.rejectWithValue(errorMessage(e))
      }
    }
  ),
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
      await setDoc(doc(publicationsCollection, uid), newPublication)
      return { uid, ...newPublication }
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
  likeToggle: createAsyncThunk(
    'publications/likeToggle',
    async ({ isLiked, publicationUid }: LikeToggleType, thunkAPI) => {
      const { userReducer } = thunkAPI.getState() as RootState
      const userUid: string = userReducer.user.uid
      try {
        // Not awaited, as before: the like shows at once; failures are logged.
        updateDoc(doc(publicationsCollection, publicationUid), {
          likes: isLiked ? arrayRemove(userUid) : arrayUnion(userUid),
        }).catch(e => console.warn(`[publications] like: ${errorMessage(e)}`))
        return { isLiked, publicationUid, userUid }
      } catch (e) {
        return thunkAPI.rejectWithValue(errorMessage(e))
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
        await updateDoc(doc(publicationsCollection, publication.uid), {
          downloads: arrayUnion(ownerUid),
        })
        return { publicationUid: publication.uid, userUid: ownerUid }
      }
      return null
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
  delete: createAsyncThunk('publications/delete', async (publication: PublicType, thunkAPI) => {
    const { userReducer } = thunkAPI.getState() as RootState
    const ownerUid: string = userReducer.user.uid
    try {
      if (publication.ownerUid === ownerUid) {
        await deleteDoc(doc(publicationsCollection, publication.uid))
        return publication.uid
      }
      return thunkAPI.rejectWithValue("You can't delete this")
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
}
