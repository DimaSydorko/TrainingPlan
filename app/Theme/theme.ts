import { TextStyle, ViewStyle } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import { colors } from './colors'
import { screen } from '../Utils/constants'

export const theme = {
  text: {
    header: {
      fontSize: 18,
      fontWeight: '700',
    } as TextStyle,
    ordinary: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '500',
    } as TextStyle,
    secondary: {
      color: `${colors.text}80`,
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,
    link: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 16,
    } as TextStyle,
  },

  view: {
    background: {
      background: colors.background,
    } as ViewStyle,
    card: {
      backgroundColor: colors.white,
      padding: 14,
      borderRadius: 10,
      margin: 6,
      width: screen.vw - 30,
    } as ViewStyle,
    shadow: {
      shadowColor: colors.black,
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: {
        width: 4,
        height: 2,
      },
    } as ViewStyle,
  },

  containers: {
    centerColumn: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,
    center: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    } as ViewStyle,
    alignCenter: {
      display: 'flex',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,
    spaceBetween: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    secondHeader: {
      marginVertical: 10,
      paddingHorizontal: 5,
      width: screen.vw - 10,
    } as ViewStyle,
    end: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
  },

  margin: {
    top20: {
      marginTop: 20,
    } as ViewStyle,
  },
  screenOptions: {
    headerStyle: {
      backgroundColor: colors.menu,
    },
    headerTitleAlign: 'center',
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: 'bold',
    } as ViewStyle,
  } as StackNavigationOptions,
}
