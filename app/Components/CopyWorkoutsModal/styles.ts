import { StyleSheet } from 'react-native'
import { screen } from '../../Utils/constants'
import { headerHeight } from '../../Theme/theme'

export default StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
    maxHeight: screen.vh - headerHeight * 4,
  },
  plan: {
    margin: 2,
    padding: 6,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedIcon: {
    position: 'absolute',
    opacity: 0.8,
    zIndex: 0,
  },
  textHeader: {
    width: screen.vw - 210,
    zIndex: 1,
  },
})
