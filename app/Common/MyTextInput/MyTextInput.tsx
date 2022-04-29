import * as React from 'react'
import { TextInput, TextStyle } from 'react-native'
import { colors } from '../../Theme/colors'
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
  type = 'ordinary',
}: MyTextInputType) {
  return (
    <TextInput
      style={[
        type === 'ordinary' && styles.ordinary,
        type === 'underline' && styles.underline,
        type === 'secondary' && styles.secondary,
        style,
      ]}
      autoFocus={autoFocus}
      placeholderTextColor={colors.text}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      onChangeText={text => onChangeText(text)}
      value={value}
      underlineColorAndroid='transparent'
      autoCapitalize='none'
    />
  )
}
