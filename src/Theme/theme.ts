import {ViewStyle} from "react-native";
import {StackNavigationOptions} from "@react-navigation/stack";
import {colors} from "./colors";

export const theme = {
  link: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16
  } as ViewStyle,
  text: {
    color: colors.text,
    fontSize: 16
  } as ViewStyle,
  container: {
    flex: 1,
    alignItems: 'center'
  } as ViewStyle,
  margin: {
    top20: {
      marginTop: 20
    },
  } as ViewStyle,
  background: {
    background: colors.background,
  } as ViewStyle,
  stackScreenOptions: {
    headerStyle: {
      backgroundColor: colors.menu,
    },
    headerTitleAlign: 'center',
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: 'bold',
    } as ViewStyle,
  } as StackNavigationOptions
}