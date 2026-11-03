import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 24,
    position: 'absolute',
    zIndex: 101,
    bottom: spacing.md,
    right: spacing.md,
  },
})
