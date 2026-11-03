import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'
import { GREETING_NAME_FONT_SIZE } from '../home-screen.constants'

export default StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    flex: 1,
  },
  name: {
    fontSize: GREETING_NAME_FONT_SIZE,
  },
})
