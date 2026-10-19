import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserDataType, UserType } from '@utils/types'
import { userAC } from './user-ac'

export type UserSliceType = {
  user: UserType | null
  data: UserDataType | null
  isLoading: boolean
  error: string
}

export const initialUserData: UserDataType = {
  friendsUIDs: [],
}

const initialState: UserSliceType = {
  user: null,
  data: null,
  isLoading: false,
  error: '',
}

const onError = (state: UserSliceType, { payload }: PayloadAction<string>) => {
  state.isLoading = false
  state.error = payload
}

const onLoading = (state: UserSliceType) => {
  state.isLoading = true
}

const onDataUpdate = (state: UserSliceType, { payload }: PayloadAction<UserDataType>) => {
  state.data = payload
  state.isLoading = false
  state.error = ''
}

const onLogin = (state: UserSliceType, { payload }: PayloadAction<UserType>) => {
  state.user = payload
  state.isLoading = false
  state.error = ''
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    errorUserClear(state) {
      state.error = ''
    },
    // From onAuthStateChanged (authListener.ts)
    authUserChanged(state, { payload }: PayloadAction<UserType>) {
      state.user = payload
    },
    // Firebase has no session any more: show the login screen. Cached workouts and plans are kept
    // so unsynced local changes survive and sync when the same user logs in again.
    sessionEnded(state) {
      state.user = null
      state.data = null
      state.isLoading = false
    },
  },
  extraReducers: builder => {
    builder
      .addCase(userAC.signOut.fulfilled.type, state => {
        state.user = null
        state.data = null
        state.isLoading = false
        state.error = ''
      })
      .addCase(userAC.signIn.fulfilled.type, onLogin)
      .addCase(userAC.signUp.fulfilled.type, onLogin)
      .addCase(userAC.signInWithGoogle.fulfilled.type, onLogin)
      .addCase(userAC.dataRequest.fulfilled.type, onDataUpdate)
      .addCase(userAC.dataUpdate.fulfilled.type, onDataUpdate)
      .addCase(userAC.dataUpdate.pending.type, onLoading)
      .addCase(userAC.signIn.pending.type, onLoading)
      .addCase(userAC.signUp.pending.type, onLoading)
      .addCase(userAC.signInWithGoogle.pending.type, onLoading)
      .addCase(userAC.dataRequest.pending.type, onLoading)
      .addCase(userAC.signOut.pending.type, onLoading)
      .addCase(userAC.signUp.rejected.type, onError)
      .addCase(userAC.signInWithGoogle.rejected.type, onError)
      .addCase(userAC.signIn.rejected.type, onError)
      .addCase(userAC.signOut.rejected.type, (state: UserSliceType, { payload }: PayloadAction<string>) => {
        state.isLoading = false
        state.error = payload
        state.user = null
      })
      .addCase(userAC.dataUpdate.rejected.type, onError)
      .addCase(userAC.dataRequest.rejected.type, onError)
  },
})
export const { errorUserClear, authUserChanged, sessionEnded } = userSlice.actions
export default userSlice.reducer
