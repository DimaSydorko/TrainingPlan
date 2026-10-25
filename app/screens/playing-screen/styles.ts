import { StyleSheet } from 'react-native'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'
import { HEADER_BAR_STYLE } from '@theme/navigation-theme.constants'
import { radius } from '@theme/tokens'

export default StyleSheet.create({
  page: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
  },
  header: {
    ...HEADER_BAR_STYLE,
    paddingHorizontal: 15,
    paddingVertical: 15,
    width: '100%',
    zIndex: 15,
    height: BAR_HEIGHT.FOOTER,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: 15,
    height: 55,
    width: '100%',
    zIndex: 15,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 4,
      height: 2,
    },
    elevation: 2,
  },
  nextExercise: {
    height: 48,
    marginVertical: 10,
  },
  textCenter: {
    height: 48,
  },
  timerContainer: {
    borderRadius: radius.round,
    marginVertical: 15,
  },
  timerContent: {
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 24,
  },
  remainingTime: {
    fontSize: 22,
  },
  controls: {
    width: '50%',
  },
})
