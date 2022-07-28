import * as React from 'react'
import { View } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { TextHeader } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'

export default function EmptyScreen() {
  const { colors } = useSettings()
  return (
    <View style={[theme.containers.centerColumn, { backgroundColor: colors.background }]}>
      <TextHeader>EmptyScreen</TextHeader>
    </View>
  )
}
