import { StyleSheet } from 'react-native';
import {colors} from "../../Theme/colors";
import {screen} from "../../Utils/constants";

export default StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    color: colors.black,
    backgroundColor: colors.white,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    width: screen.vw - 40,
  }
})