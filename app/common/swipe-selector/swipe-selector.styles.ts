import { StyleSheet } from 'react-native'
import { ITEM_HEIGHT, PADDING, WRAPPER_HEIGHT, WRAPPER_WIDTH } from './swipe-selector.constants'

const ITEM_FONT_SIZE = 19
const ITEM_LINE_HEIGHT = 26

export default StyleSheet.create({
  wrapper: {
    height: WRAPPER_HEIGHT,
    width: WRAPPER_WIDTH,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  selection: {
    position: 'absolute',
    top: PADDING,
    height: ITEM_HEIGHT,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  listContent: {
    paddingVertical: PADDING,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: ITEM_FONT_SIZE,
    lineHeight: ITEM_LINE_HEIGHT,
    fontWeight: 'normal',
  },
})
