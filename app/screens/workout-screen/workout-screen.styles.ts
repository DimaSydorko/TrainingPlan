import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'
import { BAR_HEIGHT } from '@theme/bar-heights.constants'

const NAME_INPUT_HEIGHT_OFFSET = 2
const EXERCISE_LIST_PADDING_VERTICAL = 10

export default StyleSheet.create({
  content: {
    paddingHorizontal: spacing.sm,
  },
  nameInput: {
    height: BAR_HEIGHT.HEADER - NAME_INPUT_HEIGHT_OFFSET,
  },
  exerciseList: {
    paddingVertical: EXERCISE_LIST_PADDING_VERTICAL,
  },
})
