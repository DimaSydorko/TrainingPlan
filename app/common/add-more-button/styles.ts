import { StyleSheet } from 'react-native'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { spacing } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 24,
    position: 'absolute',
    zIndex: 101,
    bottom: BAR_HEIGHT.FOOTER + 20,
    right: 20,
  },
})
