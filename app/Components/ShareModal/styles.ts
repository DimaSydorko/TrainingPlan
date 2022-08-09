import { StyleSheet } from 'react-native'
import { screen } from '../../Utils/constants'
import { headerHeight } from '../../Theme/theme'

export default StyleSheet.create({
  container: {
    marginTop: 10,
    maxHeight: screen.vh - headerHeight * 4,
  },
  card: {
    width: '100%',
  },
})
