import { StyleSheet } from 'react-native'
import { fontSize, radius, shadow, spacing } from '@theme/tokens'
import { ASK_AI_INPUT_MIN_HEIGHT } from './ask-ai-bar.constants'

export default StyleSheet.create({
  bar: {
    width: '100%',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadow.bar,
  },
  reply: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  field: {
    minHeight: ASK_AI_INPUT_MIN_HEIGHT,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    padding: spacing.sm,
  },
})
