import { StyleSheet } from 'react-native'
import { appScreen } from '../../Utils/constants'

export default StyleSheet.create({
  emptySpace: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  modal: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  container: {
    zIndex: 1,
    maxWidth: 500,
    minHeight: 150,
    width: appScreen.vw - 40,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 48,
    padding: 15
  },
  content: {
    minHeight: 100
  },
  text: {
    textAlign: 'center'
  },
  extraPlaceRight: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  extraPlaceLeft: {
    position: 'absolute',
    top: 0,
    left: 0
  }
})
