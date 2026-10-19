import { StyleSheet } from 'react-native'
import { HEADER_BAR_STYLE } from '@theme/navigation-theme.constants'
import { spacing } from '@theme/tokens'
import { APP_FOOTER_HORIZONTAL_PADDING, APP_FOOTER_Z_INDEX } from './app-footer.constants'

export default StyleSheet.create({
  footer: {
    ...HEADER_BAR_STYLE,
    width: '100%',
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    left: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: APP_FOOTER_HORIZONTAL_PADDING,
    zIndex: APP_FOOTER_Z_INDEX,
  },
})
