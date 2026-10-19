import { StyleSheet } from 'react-native'
import { radius } from '@theme/tokens'

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  selectedContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: 35,
    width: '100%',
  },
  preview: {
    borderRadius: radius.round,
    height: 30,
    width: 30,
  },
  modal: {
    borderWidth: 10,
  },
  colorSelect: {
    height: 60,
    width: 60,
    borderRadius: 30,
    margin: 5,
  },
  colorsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
})
