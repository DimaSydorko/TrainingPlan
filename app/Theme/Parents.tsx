import * as React from 'react'
import { ReactNode } from 'react'
import { ScrollView, StyleProp, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import { useSettings } from '../Hooks/redux'
import { theme } from './theme'
import { colorsFixed } from './colors'
import { appScreen } from '../Utils/constants'
import { useAppInsets } from './insets'

interface ParentProps {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

interface TextParentProps {
  children?: ReactNode
  style?: StyleProp<TextStyle>
}

type IText = Omit<TextProps, 'style'> & {
  color?: string
  center?: boolean
}

interface IPage {
  scrollDisabled?: boolean
}

export const Page = ({ children, style, scrollDisabled = false }: ParentProps & IPage) => {
  const { colors } = useSettings()
  // The stack header already covers the top inset; the bottom padding keeps content above the
  // absolutely positioned tab bar, which is taller by the navigation bar inset (edge-to-edge).
  const { footer } = useAppInsets()
  return (
    <View style={[theme.containers.centerColumn, { backgroundColor: colors.background, paddingBottom: footer }, style]}>
      <ScrollView scrollEnabled={!scrollDisabled}>{children}</ScrollView>
    </View>
  )
}

export const TextSecondary = ({ children, color, center = false, style, ...props }: TextParentProps & IText) => {
  const { colors } = useSettings()
  const newColors = color || colors.textSecondary
  return (
    <Text
      style={[
        {
          ...theme.text.secondary,
          textAlign: center ? 'center' : 'left',
          color: newColors,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
}

export const TextHeader = ({ children, color, center = false, style, ...props }: TextParentProps & IText) => {
  const { colors } = useSettings()
  const newColors = color || colors.text
  return (
    <Text
      style={[
        {
          ...theme.text.header,
          textAlign: center ? 'center' : 'left',
          color: newColors,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
}

export const TextOrdinary = ({ children, color, center = false, style, ...props }: TextParentProps & IText) => {
  const { colors } = useSettings()
  const newColors = color || colors.text
  return (
    <Text
      style={[
        {
          ...theme.text.ordinary,
          textAlign: center ? 'center' : 'left',
          color: newColors,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
}

export const FlexSpaceBetween = ({ children, style }: ParentProps) => {
  return <View style={[theme.containers.spaceBetween, style]}>{children}</View>
}

export const FlexCenterColumn = ({ children, style }: ParentProps) => {
  return <View style={[theme.containers.centerColumn, style]}>{children}</View>
}

export const FlexCenter = ({ children, style }: ParentProps) => {
  return <View style={[theme.containers.center, style]}>{children}</View>
}

export const FlexEnd = ({ children, style }: ParentProps) => {
  return <View style={[theme.containers.end, style]}>{children}</View>
}

export const FlexStart = ({ children, style }: ParentProps) => {
  return <View style={[theme.containers.alignCenter, style]}>{children}</View>
}

export const Divider = ({
  style,
  isDashed = false,
  color = '',
  width = 2,
}: ParentProps & { color?: string; isDashed?: boolean; width?: number }) => {
  const { colors } = useSettings()
  return (
    <View
      style={[
        {
          width: '100%',
          borderBottomColor: color || colors.secondPrimary,
          borderStyle: isDashed ? 'dashed' : 'solid',
          borderBottomWidth: width,
        },
        style,
      ]}
    />
  )
}

export const Card = ({ children, style, borderLeftColor }: ParentProps & { borderLeftColor?: string }) => {
  const { colors } = useSettings()
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          shadowColor: colorsFixed.shadow,
        },
        theme.view.card,
        theme.view.shadow,
        !!borderLeftColor
          ? {
              borderLeftColor,
              borderLeftWidth: 6,
            }
          : {},
        style,
      ]}
    >
      {children}
    </View>
  )
}

export const AppHeader = ({ children, style }: ParentProps) => {
  const { colors } = useSettings()
  return (
    <View
      style={[
        theme.containers.headerStyle,
        {
          width: '100%',
          backgroundColor: colors.menu,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          top: -appScreen.header,
          left: 0,
          padding: 8,
          zIndex: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export const AppFooter = ({ children, style }: ParentProps) => {
  const { colors } = useSettings()
  const { bottom } = useAppInsets()
  return (
    <View
      style={[
        theme.containers.headerStyle,
        {
          width: '100%',
          backgroundColor: colors.menu,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          bottom: 0,
          left: 0,
          height: appScreen.header + bottom,
          paddingTop: 8,
          paddingBottom: 8 + bottom,
          paddingHorizontal: 30,
          zIndex: 100,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export const useScreenOptions = (): StackNavigationOptions => {
  const { colors } = useSettings()
  // The header height includes the status bar inset (React Navigation draws it behind the bar),
  // so the visible part keeps the old 40dp height on edge-to-edge Android and notched iPhones.
  const { header } = useAppInsets()
  return {
    ...theme.screenOptions,
    headerTintColor: colors.text,
    headerStyle: {
      ...theme.containers.headerStyle,
      backgroundColor: colors.menu,
      shadowColor: colorsFixed.shadow,
      height: header,
    },
    cardStyle: { backgroundColor: colors.background },
  }
}
