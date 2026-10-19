import { StyleSheet } from 'react-native'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { radius, spacing } from '@theme/tokens'

const FOOTER_BUTTON_INSET = 16

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
  footerButton: {
    marginTop: spacing.none,
    width: '90%',
    height: BAR_HEIGHT.FOOTER - FOOTER_BUTTON_INSET,
    paddingVertical: spacing.none,
  },
})
