import * as React from 'react'
import { Vibration, View } from 'react-native'
import { useAppDispatch, useSettings } from '../../Hooks/redux'
import { userActionCreators } from '../../store/UserReducer/UserActionCreators'
import { clearPlaneResults } from '../../store/PlansReducer/PlansSlice'
import { clearWorkoutResults } from '../../store/WorkoutReducer/WorkoutSlice'
import { ConfirmButton, MySwitch } from '../../Common'
import { deepCompare } from '../../Utils'
import { clearSettings, onThemeChange, onVibrationToggle } from '../../store/SettingsReducer/SettingsSlice'
import { FlexCenter, TextHeader, TextSecondary } from '../../Theme/Parents'
import { VIBRATION } from '../../Utils/constants'
import { colorsDark, colorsLight } from '../../Theme/colors'
import { theme } from '../../Theme/theme'

export default function EmptyScreen() {
  const dispatch = useAppDispatch()
  const { colors, isVibration, internet } = useSettings()
  const isDarkTheme = deepCompare(colors, colorsDark)

  const signOut = () => dispatch(userActionCreators.signOut())
  const onThemeToggle = () => dispatch(onThemeChange(isDarkTheme ? colorsLight : colorsDark))
  const onVibration = () => {
    if (!isVibration) Vibration.vibrate(VIBRATION.TIMER)
    dispatch(onVibrationToggle())
  }

  const clearAll = () => {
    dispatch(clearWorkoutResults())
    dispatch(clearPlaneResults())
    dispatch(clearSettings())
  }

  return (
    <View style={[theme.containers.centerColumn, { backgroundColor: colors.background }]}>
      <TextHeader>EmptyScreen</TextHeader>
      <TextSecondary>Is Internet connected: {internet?.isOnline ? 'Yes' : 'No'}</TextSecondary>
      <ConfirmButton header={'Sign out'} onPress={signOut} />
      <ConfirmButton header={'Clear storage'} color={colors.secondPrimary} onPress={clearAll} />

      <FlexCenter style={{ marginVertical: 10 }}>
        <TextHeader style={{ marginRight: 10 }}>Theme: {isDarkTheme ? 'Dark' : 'Light'}</TextHeader>
        <MySwitch value={isDarkTheme} onValueChange={onThemeToggle} />
      </FlexCenter>
      <FlexCenter style={{ marginVertical: 10 }}>
        <TextHeader style={{ marginRight: 10 }}>Vibration: {isVibration ? 'ON' : 'OFF'}</TextHeader>
        <MySwitch value={isVibration} disableVibration onValueChange={onVibration} />
      </FlexCenter>
    </View>
  )
}
