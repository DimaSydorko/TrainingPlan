import { StyleSheet } from 'react-native'
import { fontSize, radius, spacing } from '@theme/tokens'

export default StyleSheet.create({
  button: {
    marginHorizontal: 30,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    height: 48,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
})
