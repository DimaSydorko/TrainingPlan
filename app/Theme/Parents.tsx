import * as React from 'react'
import { ReactNode } from 'react'
import { SafeAreaView, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import { theme } from './theme'
import { colors } from './colors'

interface ParentProps {
  children?: ReactNode
  style?: ViewStyle | TextStyle | ViewStyle[] | TextStyle[]
}

interface IText {
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
  scrollEnabled?: boolean
}

export const Page = ({ children, style, scrollEnabled = true }: ParentProps & IPage) => {
  return (
    <SafeAreaView style={[theme.containers.centerColumn, style]}>
      <ScrollView scrollEnabled={scrollEnabled}>{children}</ScrollView>
    </SafeAreaView>
  )
}

export const TextSecondary = ({
  children,
  color = colors.textSecondary,
  center = false,
  style
}: ParentProps & IText) => {
  return (
    <Text
      style={[
        {
          ...theme.text.secondary,
          textAlign: center ? 'center' : 'left',
          color
        },
        style
      ]}
    >
      {children}
    </Text>
  )
}

export const TextHeader = ({ children, color = colors.text, center = false, style }: ParentProps & IText) => {
  return <Text style={[{ ...theme.text.header, textAlign: center ? 'center' : 'left', color }, style]}>{children}</Text>
}

export const TextOrdinary = ({ children, color = colors.text, center = false, style }: ParentProps & IText) => {
  return (
    <Text style={[{ ...theme.text.ordinary, textAlign: center ? 'center' : 'left', color }, style]}>{children}</Text>
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

export const Card = ({ children, style, borderLeftColor }: ParentProps & { borderLeftColor?: string }) => (
  <View
    style={[
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

export const CardPressed = ({
  children,
  onPress,
  onPressOut,
  onPressIn,
  style,
  borderLeftColor
}: ParentProps & OnPressType) => (
  <TouchableOpacity
    style={[
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
