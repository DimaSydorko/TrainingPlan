import { StyleSheet } from 'react-native'
import { colors } from '../../Theme/colors'
import { screen } from '../../Utils/constants'

export default StyleSheet.create({
  emptySpace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: `${colors.black}40`,
  },
  modal: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    zIndex: 1,
    maxWidth: 500,
    minHeight: 150,
    width: screen.vw - 40,
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 48,
    padding: 15,
  },
  content: {
    minHeight: 100,
  },
  text: {
    textAlign: 'center',
  }
})