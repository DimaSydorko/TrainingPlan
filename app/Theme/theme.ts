import { TextStyle, ViewStyle } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import { screen } from '../Utils/constants'

const headerStyle: TextStyle = {
  height: 55,
  shadowOpacity: 0.1,
  shadowRadius: 5,
  shadowOffset: {
    width: 4,
    height: 2
  },
  elevation: 4
}

export const theme = {
  text: {
    header: {
      fontSize: 18,
      fontWeight: '700'
    } as TextStyle,
    ordinary: {
      fontSize: 18,
      fontWeight: '500'
    } as TextStyle,
    secondary: {
      fontSize: 14,
      fontWeight: '600'
    } as TextStyle,
    link: {
      fontWeight: 'bold',
      fontSize: 16
    } as TextStyle
  },

  view: {
    card: {
      padding: 14,
      borderRadius: 10,
      margin: 6,
      width: screen.vw - 30
    } as ViewStyle,
    shadow: {
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: {
        width: 4,
        height: 2
      },
      elevation: 3
    } as ViewStyle
  },

  containers: {
    centerColumn: {
      flex: 1,
      alignItems: 'center'
    } as ViewStyle,
    center: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row'
    } as ViewStyle,
    alignCenter: {
      display: 'flex',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    } as ViewStyle,
    spaceBetween: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center'
    } as ViewStyle,
    secondHeader: {
      marginVertical: 10,
      paddingHorizontal: 5,
      width: screen.vw - 10
    } as ViewStyle,
    end: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center'
    } as ViewStyle,
    headerStyle
  },

  margin: {
    top20: {
      marginTop: 20
    } as ViewStyle
  },
  screenOptions: {
    headerTitleAlign: 'center',
    headerTitleStyle: {
      fontWeight: 'bold'
    } as ViewStyle
  } as StackNavigationOptions
}
