import { StyleSheet } from 'react-native'
import { screen } from '../../Utils/constants'
import { colors } from '../../Theme/colors'

export default StyleSheet.create({
  container: {
    // width: '100%',
    // height: 40,
    // height: 240,
    // width: 60,
    borderWidth: 1,
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    width: 37,
    textAlign: 'center',
  },
  itemsContainer: {
    paddingHorizontal: (screen.vw - 98) / 2,
  },
  selectPoint: {
    width: 40,
    borderTopWidth: 2,
    borderTopColor: colors.text,
  },
})