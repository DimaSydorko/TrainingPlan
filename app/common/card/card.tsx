import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useScreen } from '@platform/screen'
import { LAYOUT_GUTTER } from '@theme/layout.constants'
import { useThemeColors } from '@theme/use-app-theme'
import styles from './card.styles'

export type CardProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  borderLeftColor?: string
  testID?: string
}

const Card = ({ children, style, borderLeftColor, testID }: CardProps) => {
  const colors = useThemeColors()
  const { width } = useScreen()

  return (
    <View
      style={[
        { backgroundColor: colors.surface, shadowColor: colors.shadow },
        styles.card,
        { width: width - LAYOUT_GUTTER.CARD },
        styles.shadow,
        !!borderLeftColor && [styles.accentBorder, { borderLeftColor }],
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  )
}

export default Card
