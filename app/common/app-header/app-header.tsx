import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useThemeColors } from '@theme/use-app-theme'
import styles from './app-header.styles'

export type AppHeaderProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
}

const AppHeader = ({ children, style, testID }: AppHeaderProps) => {
  const colors = useThemeColors()

  return (
    <View style={[styles.header, { backgroundColor: colors.surfaceElevated }, style]} testID={testID}>
      {children}
    </View>
  )
}

export default AppHeader
