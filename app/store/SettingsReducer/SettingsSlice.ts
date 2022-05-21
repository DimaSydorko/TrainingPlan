import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ColorsType } from '../../Utils/types'
import { colorsLight } from '../../Theme/colors'

interface SettingsType {
  colors: ColorsType
  isVibration: boolean
  internet: {
    isOnline: boolean
    lastBeOline: number
  }
}

const initialState: SettingsType = {
  colors: colorsLight,
  isVibration: true,
  internet: {
    isOnline: false,
    lastBeOline: 0
  }
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    onThemeChange: (state, { payload }: PayloadAction<ColorsType>) => {
      state.colors = payload
    },
    clearSettings: state => {
      state.internet = initialState.internet
      state.colors = initialState.colors
      state.isVibration = true
    },
    onVibrationToggle: state => {
      state.isVibration = !state.isVibration
    },
    onInternetConnectionChange: (state, { payload }: PayloadAction<boolean>) => {
      state.internet.isOnline = payload
      if (payload) state.internet.lastBeOline = new Date().getTime()
    }
  }
})
export const { onThemeChange, onVibrationToggle, onInternetConnectionChange, clearSettings } = settingsSlice.actions
export default settingsSlice.reducer
