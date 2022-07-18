import { StyleSheet } from 'react-native'
import { screen } from '../../Utils/constants'
import { headerHeight } from '../../Theme/theme'

export default StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 24,
    position: 'absolute',
    zIndex: 101,
    top: screen.vh - headerHeight * 3 - 10,
    right: 20,
  },
})
