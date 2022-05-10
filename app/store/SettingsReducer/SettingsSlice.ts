import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ColorsType } from '../../Utils/types'
import { colorsLight } from '../../Theme/colors'

interface SettingsType {
  colors: ColorsType
  isVibration: boolean
}

const initialState: SettingsType = {
  colors: colorsLight,
  isVibration: true
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    onThemeChange: (state, { payload }: PayloadAction<ColorsType>) => {
      state.colors = payload
    },
    onVibrationToggle: state => {
      state.isVibration = !state.isVibration
    }
  }
})
export const { onThemeChange, onVibrationToggle } = settingsSlice.actions
export default settingsSlice.reducer
