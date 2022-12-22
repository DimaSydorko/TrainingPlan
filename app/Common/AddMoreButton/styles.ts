import { StyleSheet } from 'react-native'
import { appScreen } from '../../Utils/constants'

export default StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 24,
    position: 'absolute',
    zIndex: 101,
    bottom: appScreen.footer + 20,
    right: 20,
  },
})
