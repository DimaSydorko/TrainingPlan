import { StyleSheet } from 'react-native'
import { colors } from '../../Theme/colors'
import { screen } from '../../Utils/constants'

export default StyleSheet.create({
  page: {
    height: screen.vh,
    width: screen.vw,
    position: 'absolute',
    zIndex: 10,
    backgroundColor: colors.background,
    top: 0,
    left: 0
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    width: '100%',
    zIndex: 10
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: 15,
    height: 55,
    width: '100%',
    zIndex: 10,
    backgroundColor: colors.menu,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 4,
      height: 2
    },
    elevation: 2
  }
})
