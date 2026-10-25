import { StyleSheet } from 'react-native'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { HEADER_BAR_STYLE } from '@theme/navigation-theme.constants'
import { spacing } from '@theme/tokens'
import { APP_HEADER_Z_INDEX } from './app-header.constants'

export default StyleSheet.create({
  header: {
    ...HEADER_BAR_STYLE,
    width: '100%',
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: -BAR_HEIGHT.HEADER,
    left: 0,
    padding: spacing.sm,
    zIndex: APP_HEADER_Z_INDEX,
  },
})
