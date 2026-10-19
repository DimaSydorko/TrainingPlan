import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'
import { IMG_SIZE } from './exercise.constants'

export default StyleSheet.create({
  breakContainer: {
    width: 250,
    paddingHorizontal: 50,
    height: 180,
  },
  swipeContainer: {
    height: 150,
  },
  breakText: {
    textAlign: 'center',
    width: 75,
  },
  iconButton: {
    marginLeft: 7,
  },
  withImage: {
    marginLeft: IMG_SIZE,
    width: '86.5%',
  },
  image: {
    marginLeft: -10,
  },
  imageContainer: {
    position: 'absolute',
    marginLeft: -10,
    marginRight: 10,
    marginTop: spacing.none,
  },
  approaches: {
    marginLeft: 10,
  },
  editActions: {
    width: 100,
  },
  breakTime: {
    width: 150,
  },
})
