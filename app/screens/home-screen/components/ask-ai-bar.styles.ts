import { StyleSheet } from 'react-native'
import { radius, spacing } from '@theme/tokens'

export default StyleSheet.create({
  bar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
})
