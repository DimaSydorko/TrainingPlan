import * as React from 'react'
import { ReactNode } from 'react'
import { SafeAreaView, ScrollView, Text, TextProps, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useSettings } from '../Hooks/redux'
import { headerHeight, theme } from './theme'
import { colorsFixed } from './colors'

interface ParentProps {
  children?: ReactNode
  style?: ViewStyle | TextStyle | ViewStyle[] | TextStyle[]
}

type IText = TextProps & {
  color?: string
  center?: boolean
}

interface OnPressType {
  onPress: () => void
  onPressOut?: () => void
  onPressIn?: () => void
  borderLeftColor?: string
}

interface IPage {
  scrollDisabled?: boolean
}

export const Page = ({ children, style, scrollDisabled = false }: ParentProps & IPage) => {
  const { colors } = useSettings()
  return (
    <SafeAreaView style={[theme.containers.centerColumn, { backgroundColor: colors.background }, style]}>
      <ScrollView scrollEnabled={!scrollDisabled}>{children}</ScrollView>
    </SafeAreaView>
  )
}

export const TextSecondary = ({ children, color, center = false, style, ...props }: ParentProps & IText) => {
  const { colors } = useSettings()
  const newColors = color || colors.textSecondary
  return (
    <Text
      style={[
        {
          ...theme.text.secondary,
          textAlign: center ? 'center' : 'left',
          color: newColors
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  )
}

export const TextHeader = ({ children, color, center = false, style, ...props }: ParentProps & IText) => {
  const { colors } = useSettings()
  const newColors = color || colors.text
  return (
    <Text
      style={[
        {
          ...theme.text.header,
          textAlign: center ? 'center' : 'left',
          color: newColors
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  )
}

export const TextOrdinary = ({ children, color, center = false, style }: ParentProps & IText) => {
  const { colors } = useSettings()
  const newColors = color || colors.text
  return (
    <Text
      style={[
        {
          ...theme.text.ordinary,
          textAlign: center ? 'center' : 'left',
          color: newColors
        },
        style
      ]}
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

export const FlexAlignCenter = ({ children, style }: ParentProps) => {
  return <View style={[theme.containers.alignCenter, style]}>{children}</View>
}

export const FlexEnd = ({ children, style }: ParentProps) => {
  return <View style={[theme.containers.end, style]}>{children}</View>
}

export const FlexStart = ({ children, style }: ParentProps) => {
  return <View style={[theme.containers.alignCenter, style]}>{children}</View>
}

export const Card = ({ children, style, borderLeftColor }: ParentProps & { borderLeftColor?: string }) => {
  const { colors } = useSettings()
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          shadowColor: colorsFixed.shadow
        },
        theme.view.card,
        theme.view.shadow,
        !!borderLeftColor
          ? {
              borderLeftColor,
              borderLeftWidth: 12
            }
          : {},
        style
      ]}
    >
      {children}
    </View>
  )
}

export const CardPressed = ({
  children,
  onPress,
  onPressOut,
  onPressIn,
  style,
  borderLeftColor
}: ParentProps & OnPressType) => {
  const { colors } = useSettings()
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: colors.white,
          shadowColor: colorsFixed.shadow
        },
        theme.view.card,
        theme.view.shadow,
        borderLeftColor
          ? {
              borderLeftColor,
              borderLeftWidth: 12
            }
          : {},
        style
      ]}
      onPress={onPress}
      onPressOut={onPressOut}
      onPressIn={onPressIn}
    >
      {children}
    </TouchableOpacity>
  )
}

export const AppHeader = ({ children, style }: ParentProps) => {
  const { colors } = useSettings()
  return (
    <View
      style={[
        theme.containers.headerStyle,
        {
          backgroundColor: colors.menu,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          top: -headerHeight,
          left: 0,
          paddingVertical: 8,
          paddingHorizontal: 30,
          zIndex: 100
        },
        style
      ]}
    >
      {children}
    </View>
  )
}
