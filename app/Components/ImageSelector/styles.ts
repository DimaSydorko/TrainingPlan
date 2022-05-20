import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  listContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%'
  },
  imageCard: {
    margin: 5,
    width: 70
  },
  imageC: {
    borderRadius: 100,
    overflow: 'hidden',
    margin: 3
  },
  image: {
    height: 60,
    width: 60
  },
  imageButton: {
    height: 30,
    width: 30
  },
  selectedContainer: {
    height: 65
  },
  emptySelect: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18
  }
})
