import { StyleSheet } from 'react-native';
import {colors} from "../../Theme/colors";

export default StyleSheet.create({
  button: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: 'center',
    padding: 12,
  },
  color: {
    backgroundColor: colors.primary,
  },
  colorPressed: {
    backgroundColor: `${colors.primary}90`,
  },
  buttonTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold"
  },
})