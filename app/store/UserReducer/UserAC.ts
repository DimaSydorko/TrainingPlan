import { createAsyncThunk } from '@reduxjs/toolkit'
import { getGoogleIdToken, signOutGoogle } from '../../services/googleAuth'
import firebase, { FB_Auth, FB_Collection_UsersData } from '../../Utils/firebase'
import { UserDataType, UserType } from '../../Utils/types'
import { initialUserData } from './UserSlice'
import { clearWorkoutResults } from '../WorkoutReducer/WorkoutSlice'
import { clearPlaneResults } from '../PlansReducer/PlansSlice'

export const userAC = {
  signUp: createAsyncThunk(
    'user/signUp',
    async (props: { email: string; password: string; displayName: string }, thunkAPI) => {
      try {
        const response = await FB_Auth.createUserWithEmailAndPassword(props.email, props.password)
        thunkAPI.dispatch(userAC.dataUpdate({ userUid: response.user?.uid || '', data: initialUserData }))
        await response.user?.updateProfile({ displayName: props.displayName })
        return {
          uid: response.user?.uid,
          displayName: response.user?.displayName || '',
          photoURL: response.user?.photoURL,
          email: response.user?.email,
        } as UserType
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  signIn: createAsyncThunk('user/signIn', async (props: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await FB_Auth.signInWithEmailAndPassword(props.email, props.password)
      thunkAPI.dispatch(userAC.dataRequest(response.user?.uid || ''))
      return {
        uid: response.user?.uid,
        displayName: response.user?.displayName || '',
        photoURL: response.user?.photoURL,
        email: response.user?.email,
      } as UserType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  signInWithGoogle: createAsyncThunk('user/signInWithGoogle', async (props, thunkAPI) => {
    try {
      // hasPlayServices + signIn now live in the googleAuth seam (A2)
      const idToken = await getGoogleIdToken()
      const credential = firebase.auth.GoogleAuthProvider.credential(idToken)
      const response = await FB_Auth.signInWithCredential(credential)
      thunkAPI.dispatch(userAC.dataRequest(response.user?.uid || ''))

      return {
        uid: response.user?.uid,
        displayName: response.user?.displayName || '',
        photoURL: response.user?.photoURL,
        email: response.user?.email,
      } as UserType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  signOut: createAsyncThunk('user/signOut', async (_, thunkAPI) => {
    try {
      // revokeAccess + signOut now live in the googleAuth seam (A2)
      await signOutGoogle()
      await FB_Auth.signOut()
      thunkAPI.dispatch(clearWorkoutResults())
      thunkAPI.dispatch(clearPlaneResults())
      return
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  dataRequest: createAsyncThunk('user/dataRequest', async (userUid: string, thunkAPI) => {
    try {
      const response = await FB_Collection_UsersData.doc(userUid).get()
      return response.data() as UserDataType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  dataUpdate: createAsyncThunk('user/dataUpdate', async (props: { userUid: string; data: UserDataType }, thunkAPI) => {
    try {
      await FB_Collection_UsersData.doc(props.userUid).set(props.data)
      return props.data
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
}
