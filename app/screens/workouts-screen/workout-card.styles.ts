import { StyleSheet } from 'react-native'
import { SELECTED_ICON } from './workout-card.constants'

export default StyleSheet.create({
  selectedIcon: {
    position: 'absolute',
    left: SELECTED_ICON.OFFSET,
    top: SELECTED_ICON.OFFSET,
  },
})
