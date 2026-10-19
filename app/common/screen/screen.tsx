import { ReactNode } from 'react'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import { useAppInsets } from '@theme/insets'
import { useThemeColors } from '@theme/use-app-theme'
import styles from './screen.styles'

export type ScreenProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  scrollDisabled?: boolean
  testID?: string
}

const Screen = ({ children, style, scrollDisabled = false, testID }: ScreenProps) => {
  const colors = useThemeColors()
  const { footer } = useAppInsets()

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingBottom: footer }, style]}
      testID={testID}
    >
      <ScrollView scrollEnabled={!scrollDisabled}>{children}</ScrollView>
    </View>
  )
}

export default Screen
