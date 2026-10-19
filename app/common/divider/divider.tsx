import { StyleProp, View, ViewStyle } from 'react-native'
import { useThemeColors } from '@theme/use-app-theme'
import { DIVIDER_DEFAULT_WIDTH } from './divider.constants'
import styles from './divider.styles'

export type DividerProps = {
  style?: StyleProp<ViewStyle>
  color?: string
  isDashed?: boolean
  width?: number
  testID?: string
}

const Divider = ({ style, color, isDashed = false, width = DIVIDER_DEFAULT_WIDTH, testID }: DividerProps) => {
  const colors = useThemeColors()

  return (
    <View
      style={[
        styles.divider,
        isDashed ? styles.dashed : styles.solid,
        { borderBottomColor: color || colors.accent, borderBottomWidth: width },
        style,
      ]}
      testID={testID}
    />
  )
}

export default Divider
