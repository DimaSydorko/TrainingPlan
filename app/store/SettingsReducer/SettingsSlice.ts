import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ColorsType } from '../../Utils/types'
import { colorsLight } from '../../Theme/colors'

interface SettingsType {
  colors: ColorsType
}

const initialState: SettingsType = {
  colors: colorsLight
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    onThemeChange: (state, { payload }: PayloadAction<ColorsType>) => {
      state.colors = payload
    }
  }
})
export const { onThemeChange } = settingsSlice.actions
export default settingsSlice.reducer
