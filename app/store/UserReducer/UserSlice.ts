import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserDataType, UserType } from '../../Utils/types'
import { userAC } from './UserAC'

export interface UserSliceType {
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
  },
  extraReducers: {
    [userAC.signOut.fulfilled.type]: state => {
      state.user = null
      state.data = null
      state.isLoading = false
      state.error = ''
    },
    [userAC.signIn.fulfilled.type]: onLogin,
    [userAC.signUp.fulfilled.type]: onLogin,
    [userAC.signInWithGoogle.fulfilled.type]: onLogin,
    [userAC.dataRequest.fulfilled.type]: onDataUpdate,
    [userAC.dataUpdate.fulfilled.type]: onDataUpdate,

    [userAC.dataUpdate.pending.type]: onLoading,
    [userAC.signIn.pending.type]: onLoading,
    [userAC.signUp.pending.type]: onLoading,
    [userAC.dataRequest.pending.type]: onLoading,
    [userAC.signOut.pending.type]: onLoading,

    [userAC.signUp.rejected.type]: onError,
    [userAC.signInWithGoogle.rejected.type]: onError,
    [userAC.signIn.rejected.type]: onError,
    [userAC.signOut.rejected.type]: (state: UserSliceType, { payload }: PayloadAction<string>) => {
      state.isLoading = false
      state.error = payload
      state.user = null
    },
    [userAC.dataUpdate.rejected.type]: onError,
    [userAC.dataRequest.rejected.type]: onError,
  },
})
export const { errorUserClear } = userSlice.actions
export default userSlice.reducer
