import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ColorsType } from '../../Utils/types'
import { colorsLight } from '../../Theme/colors'

export interface SettingsSliceType {
  colors: ColorsType
  isVibration: boolean
  tts: {
    isDucking: boolean
    volume: number
    rate: number
    pitch: number
  }
  internet: {
    isOnline: boolean
    lastBeOline: number
  }
}

const initialState: SettingsSliceType = {
  colors: colorsLight,
  isVibration: true,
  internet: {
    isOnline: false,
    lastBeOline: 0,
  },
  tts: {
    isDucking: false,
    pitch: 1.5,
    rate: 0.5,
    volume: 1,
  },
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
      state.tts = initialState.tts
      state.isVibration = true
    },
    onVibrationToggle: state => {
      state.isVibration = !state.isVibration
    },
    onTtsDuckingToggle: state => {
      state.tts.isDucking = !state.tts.isDucking
    },
    onTtsVolumeChange: (state, { payload }: PayloadAction<number>) => {
      state.tts.volume = payload
    },
    onTtsPitchChange: (state, { payload }: PayloadAction<number>) => {
      state.tts.pitch = payload
    },
    onTtsRateChange: (state, { payload }: PayloadAction<number>) => {
      state.tts.rate = payload
    },
    onInternetConnectionChange: (state, { payload }: PayloadAction<boolean>) => {
      state.internet.isOnline = payload
      if (payload) state.internet.lastBeOline = new Date().getTime()
    },
  },
})
export const {
  onThemeChange,
  onVibrationToggle,
  onInternetConnectionChange,
  clearSettings,
  onTtsDuckingToggle,
  onTtsVolumeChange,
  onTtsPitchChange,
  onTtsRateChange,
} = settingsSlice.actions
export default settingsSlice.reducer
