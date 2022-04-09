import { ReactNode } from 'react'
import { SafeAreaView, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import { theme } from './theme'
import { colors } from './colors'

interface ParentProps {
  children?: ReactNode;
  style?: ViewStyle | TextStyle | ViewStyle[] | TextStyle[];
}

interface ColorType {
  color?: string;
}

interface OnPressType {
  onPress: () => void;
  onPressOut?: () => void;
  onPressIn?: () => void;
}

export const Page = ({ children, style }: ParentProps) => {
  return (
    <SafeAreaView style={[theme.containers.centerColumn, style]}>
      <ScrollView>
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

export const TextSecondary = ({ children, color = colors.textSecondary, style }: ParentProps & ColorType) => {
  return (
    <Text style={[{ ...theme.text.secondary, color }, style]}>
      {children}
    </Text>
  )
}

export const TextHeader = ({ children, color = colors.text, style }: ParentProps & ColorType) => {
  return (
    <Text style={[{ ...theme.text.header, color }, style]}>
      {children}
    </Text>
  )
}

export const TextOrdinary = ({ children, color = colors.text, style }: ParentProps & ColorType) => {
  return (
    <Text style={[{ ...theme.text.ordinary, color }, style]}>
      {children}
    </Text>
  )
}

export const FlexSpaceBetween = ({ children, style }: ParentProps) => {
  return (
    <View style={[theme.containers.spaceBetween, style]}>
      {children}
    </View>
  )
}

export const FlexCenterColumn = ({ children, style }: ParentProps) => {
  return (
    <View style={[theme.containers.centerColumn, style]}>
      {children}
    </View>
  )
}

export const FlexCenter = ({ children, style }: ParentProps) => {
  return (
    <View style={[theme.containers.center, style]}>
      {children}
    </View>
  )
}

export const FlexAlignCenter = ({ children, style }: ParentProps) => {
  return (
    <View style={[theme.containers.alignCenter, style]}>
      {children}
    </View>
  )
}

export const FlexEnd = ({ children, style }: ParentProps) => {
  return (
    <View style={[theme.containers.end, style]}>
      {children}
    </View>
  )
}

export const FlexStart = ({ children, style }: ParentProps) => {
  return (
    <View style={[theme.containers.alignCenter, style]}>
      {children}
    </View>
  )
}

export const Card = ({ children, style }: ParentProps) => {
  return (
    <View style={[theme.view.card, theme.view.shadow, style]}>
      {children}
    </View>
  )
}

export const CardPressed = ({ children, onPress, onPressOut, onPressIn, style }: ParentProps & OnPressType) => {
  return (
    <TouchableOpacity
      style={[theme.view.card, theme.view.shadow, style]}
      onPress={onPress}
      onPressOut={onPressOut}
      onPressIn={onPressIn}
    >
      {children}
    </TouchableOpacity>
  )
}

