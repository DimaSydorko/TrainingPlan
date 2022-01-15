import {colors} from "./colors";
import {ViewStyle} from "react-native";
import {screen} from "../Utils/constants";
import {StackNavigationOptions} from "@react-navigation/stack";

export const theme = {
  link: {
    color: colors.primary,
    fontWeight: 'bold' as 'bold',
    fontSize: 16
  },
  text: {
    color: colors.text,
    fontSize: 16
  },
  container: {
    flex: 1,
    alignItems: 'center' as 'center'
  },
  margin: {
    top20: {
     marginTop: 20
    },
  },
  background: {
    background: colors.bg,
  } as ViewStyle,
  stackScreenOptions (title?: string) {
    return {
      title,
      headerStyle: {
        backgroundColor: colors.menu,
        height: screen.vh * 0.06
      },
      headerTitleAlign: 'center',
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }
  },
}