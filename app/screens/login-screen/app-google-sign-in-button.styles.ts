import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

const GOOGLE_BUTTON_HEIGHT = 48
const GOOGLE_BUTTON_OFFSET_LEFT = 30

export default StyleSheet.create({
  button: {
    marginLeft: GOOGLE_BUTTON_OFFSET_LEFT,
    width: '83%',
    marginTop: spacing.xl,
    height: GOOGLE_BUTTON_HEIGHT,
  },
})
