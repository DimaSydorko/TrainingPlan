import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  footer: {
    marginTop: spacing.xl,
  },
})
