import { StyleSheet } from 'react-native';
import {colors} from "../../Theme/colors";
import {screen} from "../../Utils/constants";

export default StyleSheet.create({
  ordinary: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    color: colors.black,
    backgroundColor: colors.white,
    marginVertical: 10,
    paddingHorizontal: 12,
    width: screen.vw - 40,
  },
  underline: {
    width: screen.vw - 60,
    marginVertical: 10,
    height: 36,
    fontWeight: "bold",
    paddingHorizontal: 4,
    borderBottomColor: colors.black,
    borderBottomWidth: 1,
    fontSize: 18,
    borderRadius: 0
  },
  secondary: {
    width: screen.vw - 60,
    marginVertical: 10,
    height: 24,
    paddingHorizontal: 4,
    borderBottomColor: colors.textSecondary,
    color: colors.textSecondary,
    borderBottomWidth: 1,
    fontSize: 14,
    borderRadius: 0
  }
})