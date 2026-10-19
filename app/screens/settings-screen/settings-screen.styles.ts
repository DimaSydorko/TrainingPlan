import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

const CLEAR_BUTTON_MARGIN_TOP = 250

export default StyleSheet.create({
  soundType: {
    marginHorizontal: spacing.lg,
    marginVertical: 6,
  },
  clearButton: {
    marginTop: CLEAR_BUTTON_MARGIN_TOP,
    marginBottom: spacing.xl,
  },
})
