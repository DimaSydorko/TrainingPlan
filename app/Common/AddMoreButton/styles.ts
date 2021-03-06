import { StatusBar, StyleSheet } from 'react-native'
import { screen } from '../../Utils/constants'
import { headerHeight } from '../../Theme/theme'

export default StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 24,
    position: 'absolute',
    zIndex: 101,
    top: screen.vh + (StatusBar.currentHeight || 0) - headerHeight * 2 - 100,
    right: 20,
  },
})
