import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

const LABEL_MARGIN_LEFT = 10
const LABEL_MARGIN_BOTTOM = 6

export default StyleSheet.create({
  label: {
    marginLeft: LABEL_MARGIN_LEFT,
    marginTop: spacing.md,
    marginBottom: LABEL_MARGIN_BOTTOM,
  },
})
