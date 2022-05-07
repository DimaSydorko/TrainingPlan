import * as React from 'react'
import { Text, View } from 'react-native'
import { useAppDispatch, useSettings } from '../../Hooks/redux'
import { userActionCreators } from '../../store/UserReducer/UserActionCreators'
import { clearPlaneResults } from '../../store/PlansReducer/PlansSlice'
import { clearWorkoutResults } from '../../store/WorkoutReducer/WorkoutSlice'
import { ConfirmButton, MySwitch } from '../../Common'
import { theme } from '../../Theme/theme'
import { colorsDark, colorsLight } from '../../Theme/colors'
import { deepCompare } from '../../Utils'
import { onThemeChange } from '../../store/SettingsReducer/SettingsSlice'
import { FlexCenter, TextHeader } from '../../Theme/Parents'

export default function EmptyScreen() {
  const dispatch = useAppDispatch()
  const { colors } = useSettings()
  const isDarkTheme = deepCompare(colors, colorsDark)
  const signOut = () => {
    dispatch(userActionCreators.signOut())
  }

  const clearAll = () => {
    dispatch(clearWorkoutResults())
    dispatch(clearPlaneResults())
  }

  const onThemeToggle = () => {
    dispatch(onThemeChange(isDarkTheme ? colorsLight : colorsDark))
  }

  return (
    <View style={[theme.containers.centerColumn, { backgroundColor: colors.background }]}>
      <Text>EmptyScreen</Text>
      <ConfirmButton header={'Sign out'} onPress={signOut} />
      <ConfirmButton header={'Clear storage'} color={colors.secondPrimary} onPress={clearAll} />

      <FlexCenter style={{ marginVertical: 10 }}>
        <TextHeader>Theme</TextHeader>
        <MySwitch value={isDarkTheme} onValueChange={onThemeToggle} />
      </FlexCenter>
    </View>
  )
}
