import { createAsyncThunk } from '@reduxjs/toolkit'
import { FB_Auth, FB_Collection_UsersData } from '../../Utils/firebase'
import { UserDataType, UserType } from '../../Utils/types'
import { initialUserData } from './UserSlice'
import { clearWorkoutResults } from '../WorkoutReducer/WorkoutSlice'
import { clearPlaneResults } from '../PlansReducer/PlansSlice'
import NetInfo from '@react-native-community/netinfo'

export const userActionCreators = {
  signUp: createAsyncThunk(
    'user/signUp',
    async (props: { email: string; password: string; displayName: string }, thunkAPI) => {
      try {
        const response = await FB_Auth.createUserWithEmailAndPassword(props.email, props.password)
        thunkAPI.dispatch(userActionCreators.dataUpdate({ userUid: response.user?.uid || '', data: initialUserData }))
        await response.user?.updateProfile({ displayName: props.displayName })
        return {
          uid: response.user?.uid,
          displayName: response.user?.displayName || '',
          photoURL: response.user?.photoURL
        } as UserType
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  signIn: createAsyncThunk('user/signIn', async (props: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await FB_Auth.signInWithEmailAndPassword(props.email, props.password)
      thunkAPI.dispatch(userActionCreators.dataRequest(response.user?.uid || ''))
      return {
        uid: response.user?.uid,
        displayName: response.user?.displayName || '',
        photoURL: response.user?.photoURL
      } as UserType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  signOut: createAsyncThunk('user/signOut', async (_, thunkAPI) => {
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await FB_Auth.signOut()
      }
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
  })
}
