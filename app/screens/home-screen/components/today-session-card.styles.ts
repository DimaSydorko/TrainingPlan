import { StyleSheet } from 'react-native'
import { radius, spacing } from '@theme/tokens'

export default StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  startButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  changeButton: {
    paddingVertical: spacing.sm,
  },
})
