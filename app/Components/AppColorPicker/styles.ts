import { StyleSheet } from 'react-native'
import { screen } from '../../Utils/constants'

export default StyleSheet.create({
  container: {
    flex: 1,
    height: screen.vh - 400,
  },
  selectedContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: 35,
    width: '100%',
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
