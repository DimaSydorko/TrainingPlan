import { StyleSheet } from 'react-native'
import { screen } from '../../../Utils/constants'

export default StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 55,
    paddingTop: 10,
    paddingBottom: 110,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    left: 0,
    zIndex: 10,
  },
  confirmButton: {
    width: screen.vw - 80,
    marginBottom: 20,
  },
})
