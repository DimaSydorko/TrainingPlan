import * as React from 'react'
import { TextInput, TextStyle } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import styles from './styles'

interface MyTextInputType {
  placeholder?: string
  onChangeText: (text: string) => void
  value: string
  autoFocus?: boolean
  style?: TextStyle
  secureTextEntry?: boolean
  type?: 'ordinary' | 'underline' | 'secondary'
}

export default function MyTextInput({
  placeholder,
  style,
  onChangeText,
  value,
  autoFocus,
  secureTextEntry = false,
  type = 'ordinary'
}: MyTextInputType) {
  const { colors } = useSettings()
  return (
    <TextInput
      style={[
        type === 'ordinary' && {
          ...styles.ordinary,
          color: colors.text,
          backgroundColor: colors.white
        },
        type === 'underline' && { ...styles.underline, borderBottomColor: colors.black },
        type === 'secondary' && {
          ...styles.secondary,
          borderBottomColor: colors.textSecondary,
          color: colors.textSecondary
        },
        style
      ]}
      autoFocus={autoFocus}
      placeholderTextColor={`${colors.text}80`}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      onChangeText={onChangeText}
      value={value}
      underlineColorAndroid='transparent'
      autoCapitalize='none'
    />
  )
}
