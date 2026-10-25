import { StyleSheet } from 'react-native'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { shadow, spacing } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    width: '100%',
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    height: BAR_HEIGHT.HEADER,
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderStyle: 'solid',
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    ...shadow.card,
  },
})
