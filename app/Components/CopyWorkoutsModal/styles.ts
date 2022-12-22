import { StyleSheet } from 'react-native'
import { appScreen } from '../../Utils/constants'

export default StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
    maxHeight: appScreen.vh - (appScreen.header + appScreen.footer) * 2,
  },
  plan: {
    margin: 2,
    padding: 6,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedIcon: {
    position: 'absolute',
    opacity: 0.8,
    zIndex: 0,
  },
  textHeader: {
    width: appScreen.vw - 210,
    zIndex: 1,
  },
})
