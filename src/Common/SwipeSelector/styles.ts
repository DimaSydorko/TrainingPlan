import {StyleSheet} from 'react-native';
import {screen} from "../../Utils/constants";
import {colors} from "../../Theme/colors";

export default StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
  },
  item: {
    width: 37,
    textAlign: 'center',
  },
  itemsContainer: {
    paddingHorizontal: 140
  },
  selectPoint: {
    width: 40,
    borderTopWidth: 2,
    borderTopColor: colors.text
  }
})