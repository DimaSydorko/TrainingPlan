import { StyleSheet } from 'react-native'
import { TAB_BAR_VERTICAL_PADDING } from './app-router.constants'

export default StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingTop: TAB_BAR_VERTICAL_PADDING,
  },
})
