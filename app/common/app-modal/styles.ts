import { StyleSheet } from 'react-native'
import { radius, spacing } from '@theme/tokens'

export default StyleSheet.create({
  emptySpace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modal: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  container: {
    zIndex: 1,
    maxWidth: 500,
    minHeight: 150,
    marginHorizontal: spacing.xl,
    borderRadius: radius.base,
    marginBottom: 48,
    padding: 15,
  },
  button: {
    width: '40%',
  },
  buttonWithRefuse: {
    marginHorizontal: spacing.sm - 2,
    width: '30%',
  },
  content: {
    minHeight: 100,
  },
  text: {
    textAlign: 'center',
  },
  extraPlaceRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  extraPlaceLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
})
