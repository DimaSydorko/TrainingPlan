import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserDataType, UserType } from '../../Utils/types'
import { userActionCreators } from './UserActionCreators'

export interface UserSliceType {
  user: UserType | null
  data: UserDataType | null
  isLoading: boolean
  error: string
}

export const initialUserData: UserDataType = {
  friendsUIDs: []
}

const initialState: UserSliceType = {
  user: null,
  data: null,
  isLoading: false,
  error: ''
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
    }
  },
  extraReducers: {
    [userActionCreators.signOut.fulfilled.type]: state => {
      state.user = null
      state.data = null
      state.isLoading = false
      state.error = ''
    },
    [userActionCreators.signIn.fulfilled.type]: onLogin,
    [userActionCreators.signUp.fulfilled.type]: onLogin,
    [userActionCreators.dataRequest.fulfilled.type]: onDataUpdate,
    [userActionCreators.dataUpdate.fulfilled.type]: onDataUpdate,

    [userActionCreators.dataUpdate.pending.type]: onLoading,
    [userActionCreators.signIn.pending.type]: onLoading,
    [userActionCreators.signUp.pending.type]: onLoading,
    [userActionCreators.dataRequest.pending.type]: onLoading,
    [userActionCreators.signOut.pending.type]: onLoading,

    [userActionCreators.signUp.rejected.type]: onError,
    [userActionCreators.signIn.rejected.type]: onError,
    [userActionCreators.signOut.rejected.type]: onError,
    [userActionCreators.dataUpdate.rejected.type]: onError,
    [userActionCreators.dataRequest.rejected.type]: onError
  }
})
export const { errorUserClear } = userSlice.actions
export default userSlice.reducer
