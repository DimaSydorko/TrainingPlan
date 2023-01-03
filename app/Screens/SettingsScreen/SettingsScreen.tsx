import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { TouchableOpacity } from 'react-native'
const Sound = require('react-native-sound')

import { useAppDispatch, useSettings } from '../../Hooks/redux'
import {
  clearSettings,
  onSoundVolumeChange,
  onThemeChange,
  onTtsDuckingToggle,
  onTtsPitchChange,
  onTtsRateChange,
  onTtsVolumeChange,
  onVibrationToggle,
  onWorkoutWeightStepChange,
} from '../../store/SettingsReducer/SettingsSlice'
import { clearWorkoutResults } from '../../store/WorkoutReducer/WorkoutSlice'
import { clearPublicationResults } from '../../store/PublicationsReducer/PublicationsSlice'
import { clearPlaneResults } from '../../store/PlansReducer/PlansSlice'
import useTTS from '../../Hooks/useTTS'
import { ConfirmButton } from '../../Common'
import AppSoundPicker from '../../Components/AppSoundPicker/AppSoundPicker'
import { FlexCenter, Page, TextHeader } from '../../Theme/Parents'
import { colorsDark, colorsLight } from '../../Theme/colors'

import SettingsItem from './SettingsItem'
import SettingsHeader from './SettingsHeader'
import { getSoundText } from '../../Utils'
import { SoundType } from '../../Utils/constants'

Sound.setCategory('Playback', true)

export default memo(function SettingsScreen() {
  const dispatch = useAppDispatch()
  const onSay = useTTS()
  const { colors, isVibration, tts, workout, sound } = useSettings()
  const [isSoundModal, setIsSoundModal] = useState<boolean>(false)

  const isDarkTheme = colors.primary === colorsDark.primary
  const playSound = new Sound(sound?.type || SoundType.Bell, Sound.MAIN_BUNDLE)

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
  const onSoundVolume = useCallback(value => {
    dispatch(onSoundVolumeChange(value))
  }, [])

  const clearAll = useCallback(() => {
    dispatch(clearWorkoutResults())
    dispatch(clearPlaneResults())
    dispatch(clearPublicationResults())
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
            <TextHeader color={colors.primary}>Press for test speech</TextHeader>
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
      <SettingsHeader label={'Sound'}>
        <FlexCenter>
          <TouchableOpacity
            onPress={() => {
              playSound.setVolume(sound?.volume)
              playSound.play()
            }}
          >
            <TextHeader color={colors.primary}>Press for test sound</TextHeader>
          </TouchableOpacity>
        </FlexCenter>
      </SettingsHeader>
      <SettingsItem
        label={'Sound Volume'}
        valueSlider={sound?.volume}
        sliderMinValue={0}
        sliderMaxValue={1}
        sliderStep={0.1}
        onSliderChange={onSoundVolume}
      />
      <TouchableOpacity onPress={() => setIsSoundModal(true)}>
        <TextHeader color={colors.black} style={{ marginHorizontal: 16, marginVertical: 6 }}>
          Sound type:{' '}
          <TextHeader color={colors.secondPrimary}>{getSoundText(sound?.type || SoundType.Bell)}</TextHeader>
        </TextHeader>
      </TouchableOpacity>
      <ConfirmButton
        header={'Clear local storage'}
        style={{ marginTop: 250, marginBottom: 20 }}
        color={colors.secondPrimary}
        onPress={clearAll}
      />
      <AppSoundPicker isOpen={isSoundModal} setIsOpen={setIsSoundModal} />
    </Page>
  )
})
