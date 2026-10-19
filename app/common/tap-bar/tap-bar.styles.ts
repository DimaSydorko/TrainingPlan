import { StyleSheet } from 'react-native'
import { radius } from '@theme/tokens'

const TAP_BAR_GAP = 5

export default StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    margin: TAP_BAR_GAP,
  },
  tab: {
    marginHorizontal: TAP_BAR_GAP,
    borderRadius: radius.base,
    padding: TAP_BAR_GAP,
  },
})
