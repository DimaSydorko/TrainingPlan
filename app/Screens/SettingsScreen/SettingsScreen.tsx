import * as React from 'react'
import { memo, useCallback } from 'react'
import { TouchableOpacity } from 'react-native'
import { useAppDispatch, useSettings } from '../../Hooks/redux'
import {
  clearSettings,
  onThemeChange,
  onTtsDuckingToggle,
  onTtsPitchChange,
  onTtsRateChange,
  onTtsVolumeChange,
  onVibrationToggle,
  onWorkoutWeightStepChange,
} from '../../store/SettingsReducer/SettingsSlice'
import { clearWorkoutResults } from '../../store/WorkoutReducer/WorkoutSlice'
import { clearPlaneResults } from '../../store/PlansReducer/PlansSlice'
import useTTS from '../../Hooks/useTTS'
import { ConfirmButton } from '../../Common'
import { FlexCenter, Page, TextHeader } from '../../Theme/Parents'
import { colorsDark, colorsLight } from '../../Theme/colors'
import SettingsItem from './SettingsItem'
import SettingsHeader from './SettingsHeader'

export default memo(function SettingsScreen() {
  const dispatch = useAppDispatch()
  const onSay = useTTS()
  const { colors, isVibration, tts, workout } = useSettings()
  const isDarkTheme = colors.primary === colorsDark.primary

  const onThemeToggle = useCallback(
    () => dispatch(onThemeChange(isDarkTheme ? colorsLight : colorsDark)),
    [isDarkTheme]
  )
  const onVibration = useCallback(() => dispatch(onVibrationToggle()), [])
  const onDuckingToggle = useCallback(() => dispatch(onTtsDuckingToggle()), [])
  const onTtsVolume = useCallback(value => dispatch(onTtsVolumeChange(value)), [])
  const onTtsPitch = useCallback(value => dispatch(onTtsPitchChange(value)), [])
  const onTtsRate = useCallback(value => dispatch(onTtsRateChange(value)), [])
  const onWorkoutWeightStep = useCallback(value => dispatch(onWorkoutWeightStepChange(value)), [])

  const clearAll = useCallback(() => {
    dispatch(clearWorkoutResults())
    dispatch(clearPlaneResults())
    dispatch(clearSettings())
  }, [])

  return (
    <Page>
      <SettingsHeader label={'Colors'} />
      <SettingsItem label={'Dark Theme'} valueSwitch={isDarkTheme} onToggleSwitch={onThemeToggle} />
      <SettingsHeader label={'Workout'} />
      <SettingsItem
        label={'Weight step'}
        valueSlider={workout.weightStep}
        sliderMinValue={1}
        sliderMaxValue={10}
        sliderStep={1}
        sliderValueType={' kg'}
        onSliderChange={onWorkoutWeightStep}
      />
      <SettingsHeader label={'Sound \\ Notifications'} />
      <SettingsItem label={'Vibration'} valueSwitch={isVibration} onToggleSwitch={onVibration} />
      <SettingsHeader label={'Speaking'}>
        <FlexCenter>
          <TouchableOpacity onPress={() => onSay('Test speech')}>
            <TextHeader color={colors.secondPrimary}>Press for test speech</TextHeader>
          </TouchableOpacity>
        </FlexCenter>
      </SettingsHeader>
      <SettingsItem
        label={'Lowering other apps output level'}
        valueSwitch={tts.isDucking}
        onToggleSwitch={onDuckingToggle}
      />
      <SettingsItem label={'Volume'} valueSlider={tts.volume} sliderStep={0.1} onSliderChange={onTtsVolume} />
      <SettingsItem
        label={'Pitch'}
        valueSlider={tts.pitch}
        sliderMinValue={0.5}
        sliderMaxValue={2}
        sliderStep={0.1}
        onSliderChange={onTtsPitch}
      />
      <SettingsItem
        label={'Speed'}
        valueSlider={tts.rate}
        sliderStep={0.05}
        sliderMinValue={0.1}
        sliderMaxValue={0.9}
        onSliderChange={onTtsRate}
      />
      <ConfirmButton
        header={'Clear local storage'}
        style={{ marginTop: 250, marginBottom: 20 }}
        color={colors.secondPrimary}
        onPress={clearAll}
      />
    </Page>
  )
})
