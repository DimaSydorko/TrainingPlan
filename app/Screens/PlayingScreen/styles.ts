import { StyleSheet } from 'react-native'
import { screen } from '../../Utils/constants'

export default StyleSheet.create({
  page: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 10,
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
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 4,
      height: 2
    },
    elevation: 2
  },
  nextExercise: {
    height: 48,
    marginVertical: 10
  },
  textCenter: {
    height: 48
  },
  timerContainer: {
    borderRadius: 100,
    marginVertical: 15
  },
  timerContent: {
    justifyContent: 'center',
    maxWidth: screen.vw - 160,
    maxHeight: screen.vw - 160
  }
})
