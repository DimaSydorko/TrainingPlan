import * as React from 'react'
import { memo, useCallback, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { useShallow } from 'zustand/react/shallow'
import { previewSound } from '@platform/audio'

import { useAppDispatch } from '@hooks/redux'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { clearWorkoutResults } from '@store/workout-reducer/workout-slice'
import { clearPublicationResults } from '@store/publications-reducer/publications-slice'
import { clearPlaneResults } from '@store/plans-reducer/plans-slice'
import useTTS from '@hooks/use-tts'
import { ConfirmButton } from '@common'
import AppSoundPicker from '@components/app-sound-picker/app-sound-picker'
import { FlexCenter, Page, TextHeader } from '@theme/parents'
import { useAppTheme } from '@theme/use-app-theme'
import { THEME_MODE } from '@theme/themes.constants'

import SettingsItem from './settings-item'
import SettingsHeader from './settings-header'
import { getSoundText } from '@utils'
import { SoundType } from '@utils/constants'

export default memo(function SettingsScreen() {
  const dispatch = useAppDispatch()
  const onSay = useTTS()
  const { colors, isDark, name: themeName } = useAppTheme()
  const { themeMode, isVibration, tts, workout, sound, isSaveBatteryMode } = useSettingsStore(
    useShallow(({ themeMode, isVibration, tts, workout, sound, isSaveBatteryMode }) => ({
      themeMode,
      isVibration,
      tts,
      workout,
      sound,
      isSaveBatteryMode,
    }))
  )
  const {
    setThemeMode,
    toggleVibration,
    toggleTtsDucking,
    toggleSaveBatteryMode,
    setTtsVolume,
    setTtsPitch,
    setTtsRate,
    setWeightStep,
    setSoundVolume,
    reset: resetSettings,
  } = useSettingsStore(
    useShallow(
      ({
        setThemeMode,
        toggleVibration,
        toggleTtsDucking,
        toggleSaveBatteryMode,
        setTtsVolume,
        setTtsPitch,
        setTtsRate,
        setWeightStep,
        setSoundVolume,
        reset,
      }) => ({
        setThemeMode,
        toggleVibration,
        toggleTtsDucking,
        toggleSaveBatteryMode,
        setTtsVolume,
        setTtsPitch,
        setTtsRate,
        setWeightStep,
        setSoundVolume,
        reset,
      })
    )
  )
  const [isSoundModal, setIsSoundModal] = useState<boolean>(false)

  const isSystemTheme = themeMode === THEME_MODE.SYSTEM

  const handleDarkThemeToggle = useCallback(
    () => setThemeMode(isDark ? THEME_MODE.LIGHT : THEME_MODE.DARK),
    [isDark, setThemeMode]
  )
  const handleSystemThemeToggle = useCallback(
    () => setThemeMode(isSystemTheme ? themeName : THEME_MODE.SYSTEM),
    [isSystemTheme, themeName, setThemeMode]
  )

  const clearAll = useCallback(() => {
    dispatch(clearWorkoutResults())
    dispatch(clearPlaneResults())
    dispatch(clearPublicationResults())
    resetSettings()
  }, [dispatch, resetSettings])

  return (
    <Page>
      <SettingsHeader label={'Colors'} />
      <SettingsItem
        label={'Dark Theme'}
        valueSwitch={isDark}
        onToggleSwitch={handleDarkThemeToggle}
        testID='settings.darkTheme'
      />
      <SettingsItem
        label={'Follow system theme'}
        valueSwitch={isSystemTheme}
        onToggleSwitch={handleSystemThemeToggle}
        testID='settings.systemTheme'
      />
      <SettingsHeader label={'Performance'} />
      <SettingsItem
        label={'Safe battery mode'}
        valueSwitch={isSaveBatteryMode}
        onToggleSwitch={toggleSaveBatteryMode}
      />
      <SettingsHeader label={'Workout'} />
      <SettingsItem
        label={'Weight step'}
        valueSlider={workout.weightStep}
        sliderMinValue={1}
        sliderMaxValue={10}
        sliderStep={1}
        sliderValueType={' kg'}
        onSliderChange={setWeightStep}
      />
      <SettingsHeader label={'Sound \\ Notifications'} />
      <SettingsItem label={'Vibration'} valueSwitch={isVibration} onToggleSwitch={toggleVibration} />
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
        onToggleSwitch={toggleTtsDucking}
      />
      <SettingsItem label={'Volume'} valueSlider={tts.volume} sliderStep={0.1} onSliderChange={setTtsVolume} />
      <SettingsItem
        label={'Pitch'}
        valueSlider={tts.pitch}
        sliderMinValue={0.5}
        sliderMaxValue={2}
        sliderStep={0.1}
        onSliderChange={setTtsPitch}
      />
      <SettingsItem
        label={'Speed'}
        valueSlider={tts.rate}
        sliderStep={0.05}
        sliderMinValue={0.1}
        sliderMaxValue={0.9}
        onSliderChange={setTtsRate}
      />
      <SettingsHeader label={'Sound'}>
        <FlexCenter>
          <TouchableOpacity onPress={() => previewSound(sound?.type || SoundType.Bell, { volume: sound?.volume })}>
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
        onSliderChange={setSoundVolume}
      />
      <TouchableOpacity onPress={() => setIsSoundModal(true)}>
        <TextHeader color={colors.inverse} style={{ marginHorizontal: 16, marginVertical: 6 }}>
          Sound type: <TextHeader color={colors.accent}>{getSoundText(sound?.type || SoundType.Bell)}</TextHeader>
        </TextHeader>
      </TouchableOpacity>
      <ConfirmButton
        header={'Clear local storage'}
        style={{ marginTop: 250, marginBottom: 20 }}
        color={colors.accent}
        onPress={clearAll}
      />
      <AppSoundPicker isOpen={isSoundModal} setIsOpen={setIsSoundModal} />
    </Page>
  )
})
