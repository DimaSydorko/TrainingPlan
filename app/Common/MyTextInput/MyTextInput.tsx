import * as React from 'react'
import { TextInput, TextStyle } from 'react-native'
import { colors } from '../../Theme/colors'
import styles from './styles'

interface MyTextInputType {
  placeholder?: string;
  onChangeText: (text: string) => void;
  value: string;
  style?: TextStyle;
  secureTextEntry?: boolean;
  type?: 'ordinary' | 'underline' | 'secondary'
}

export default function MyTextInput(
  {
    placeholder,
    style,
    onChangeText,
    value,
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
      placeholderTextColor={colors.text}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      onChangeText={(text) => onChangeText(text)}
      value={value}
      underlineColorAndroid='transparent'
      autoCapitalize='none'
    />
  )
}