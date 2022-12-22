import { StyleSheet } from 'react-native'
import { appScreen } from '../../Utils/constants'

export default StyleSheet.create({
  container: {
    marginTop: 10,
    maxHeight: appScreen.vh - appScreen.header * 4,
  },
  card: {
    width: '100%',
  },
})
