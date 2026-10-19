import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { useAppInsets } from '@theme/insets'
import { spacing } from '@theme/tokens'
import { useThemeColors } from '@theme/use-app-theme'
import styles from './app-footer.styles'

export type AppFooterProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
}

const AppFooter = ({ children, style, testID }: AppFooterProps) => {
  const colors = useThemeColors()
  const { bottom } = useAppInsets()

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: colors.surfaceElevated,
          height: BAR_HEIGHT.HEADER + bottom,
          paddingBottom: spacing.sm + bottom,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  )
}

export default AppFooter
