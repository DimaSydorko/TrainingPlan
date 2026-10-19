import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

const ITEM_VERTICAL_GAP = 10

export default StyleSheet.create({
  content: {
    paddingVertical: ITEM_VERTICAL_GAP,
    paddingHorizontal: spacing.lg,
  },
  slider: {
    marginBottom: ITEM_VERTICAL_GAP,
    marginHorizontal: spacing.xxs,
  },
})
