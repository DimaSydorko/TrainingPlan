import { StyleSheet } from 'react-native'
import { fontSize, radius, spacing } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    width: '100%',
  },
  ordinary: {
    height: 48,
    borderRadius: radius.xs,
    overflow: 'hidden',
    marginVertical: 10,
    paddingHorizontal: spacing.md,
  },
  underline: {
    width: '100%',
    marginVertical: spacing.sm,
    height: 48,
    fontWeight: 'bold',
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    fontSize: fontSize.lg,
    borderRadius: 0,
  },
  secondary: {
    width: '100%',
    marginVertical: spacing.sm,
    height: 36,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    fontSize: fontSize.sm,
    borderRadius: 0,
  },
  visibilityButton: {
    position: 'absolute',
    right: 10,
    top: 22,
  },
})
