import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  hint: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  skip: {
    marginTop: spacing.xxl,
    alignSelf: 'center',
  },
})
