import { StyleSheet } from 'react-native'
import { radius, shadow, spacing } from '@theme/tokens'
import { CARD_ACCENT_BORDER_WIDTH } from './card.constants'

export default StyleSheet.create({
  card: {
    padding: 6,
    paddingLeft: spacing.sm,
    borderRadius: radius.md,
    margin: spacing.xxs,
  },
  shadow: shadow.card,
  accentBorder: {
    borderLeftWidth: CARD_ACCENT_BORDER_WIDTH,
  },
})
