import { createAsyncThunk } from '@reduxjs/toolkit'
import { getGoogleIdToken, isGoogleSignInCancelled, signOutGoogle } from '@platform/google-auth'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, usersDataCollection } from '@utils/firebase'
import { errorMessage } from '../sync'
import { toUserType } from './auth-state'
import { UserDataType } from '@utils/types'
import { initialUserData } from './user-slice'
import { clearWorkoutResults } from '../workout-reducer/workout-slice'
import { clearPlaneResults } from '../plans-reducer/plans-slice'

export const userAC = {
  signUp: createAsyncThunk(
    'user/signUp',
    async (props: { email: string; password: string; displayName: string }, thunkAPI) => {
      try {
        const response = await createUserWithEmailAndPassword(auth, props.email, props.password)
        thunkAPI.dispatch(userAC.dataUpdate({ userUid: response.user?.uid || '', data: initialUserData }))
        await updateProfile(response.user, { displayName: props.displayName })
        return toUserType(response.user)
      } catch (e) {
        return thunkAPI.rejectWithValue(errorMessage(e))
      }
    }
  ),
  signIn: createAsyncThunk('user/signIn', async (props: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await signInWithEmailAndPassword(auth, props.email, props.password)
      thunkAPI.dispatch(userAC.dataRequest(response.user?.uid || ''))
      return toUserType(response.user)
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
  signInWithGoogle: createAsyncThunk('user/signInWithGoogle', async (props, thunkAPI) => {
    try {
      // hasPlayServices + signIn now live in the googleAuth seam
      const idToken = await getGoogleIdToken()
      const credential = GoogleAuthProvider.credential(idToken)
      const response = await signInWithCredential(auth, credential)
      thunkAPI.dispatch(userAC.dataRequest(response.user?.uid || ''))

      return toUserType(response.user)
    } catch (e) {
      // The user closed the account picker: not an error, so leave userReducer.error empty.
      if (isGoogleSignInCancelled(e)) return thunkAPI.rejectWithValue('')
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
  signOut: createAsyncThunk('user/signOut', async (_, thunkAPI) => {
    try {
      // revokeAccess + signOut now live in the googleAuth seam. A Google failure (e.g. the user
      // signed in with email) must not keep the Firebase session alive.
      await signOutGoogle().catch(e => console.warn(`[auth] Google sign-out: ${errorMessage(e)}`))
      await firebaseSignOut(auth)
      thunkAPI.dispatch(clearWorkoutResults())
      thunkAPI.dispatch(clearPlaneResults())
      return
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
  dataRequest: createAsyncThunk('user/dataRequest', async (userUid: string, thunkAPI) => {
    try {
      const response = await getDoc(doc(usersDataCollection, userUid))
      return response.data() as UserDataType
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
  dataUpdate: createAsyncThunk('user/dataUpdate', async (props: { userUid: string; data: UserDataType }, thunkAPI) => {
    try {
      await setDoc(doc(usersDataCollection, props.userUid), props.data)
      return props.data
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
}
