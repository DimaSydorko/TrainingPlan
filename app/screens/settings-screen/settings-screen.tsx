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
import Stack from '@common/stack/stack'
import Screen from '@common/screen/screen'
import AppText from '@common/app-text/app-text'
import { useAppTheme } from '@theme/use-app-theme'
import { THEME_MODE } from '@theme/themes.constants'

import SettingsItem from './settings-item'
import SettingsHeader from './settings-header'
import styles from './settings-screen.styles'
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
    <Screen>
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
        <Stack preset='center'>
          <TouchableOpacity onPress={() => onSay('Test speech')}>
            <AppText variant='title' color={colors.primary}>
              Press for test speech
            </AppText>
          </TouchableOpacity>
        </Stack>
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
        <Stack preset='center'>
          <TouchableOpacity onPress={() => previewSound(sound?.type || SoundType.Bell, { volume: sound?.volume })}>
            <AppText variant='title' color={colors.primary}>
              Press for test sound
            </AppText>
          </TouchableOpacity>
        </Stack>
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
        <AppText variant='title' tone='inverse' style={styles.soundType}>
          Sound type:{' '}
          <AppText variant='title' tone='accent'>
            {getSoundText(sound?.type || SoundType.Bell)}
          </AppText>
        </AppText>
      </TouchableOpacity>
      <ConfirmButton
        header={'Clear local storage'}
        style={{ marginTop: 250, marginBottom: 20 }}
        color={colors.accent}
        onPress={clearAll}
      />
      <AppSoundPicker isOpen={isSoundModal} setIsOpen={setIsSoundModal} />
    </Screen>
  )
})
