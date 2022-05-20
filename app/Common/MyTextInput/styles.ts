import { StyleSheet } from 'react-native'
import { screen } from '../../Utils/constants'

export default StyleSheet.create({
  container: {
    width: '100%'
  },
  ordinary: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 10,
    paddingHorizontal: 12,
    width: screen.vw - 40
  },
  underline: {
    width: '100%',
    marginVertical: 8,
    height: 48,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    fontSize: 18,
    borderRadius: 0
  },
  secondary: {
    width: '100%',
    marginVertical: 8,
    height: 36,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    fontSize: 14,
    borderRadius: 0
  },
  visibilityButton: {
    position: 'absolute',
    right: 10,
    top: 22
  }
})
