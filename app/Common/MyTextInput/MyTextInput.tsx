import * as React from 'react'
import { useState } from 'react'
import { TextInput, TextStyle, View } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { IconButton } from '../index'
import { icon } from '../../Theme/icons'
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
  secureTextEntry,
  type = 'ordinary'
}: MyTextInputType) {
  const { colors } = useSettings()
  const isPasswordEnter = secureTextEntry !== undefined
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(isPasswordEnter ? !secureTextEntry : true)
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          type === 'ordinary' && {
            ...styles.ordinary,
            color: colors.text,
            backgroundColor: colors.white
          },
          type === 'underline' && { ...styles.underline, color: colors.text, borderBottomColor: colors.black },
          type === 'secondary' && {
            ...styles.secondary,
            borderBottomColor: colors.textSecondary,
            color: colors.textSecondary
          },
          style
        ]}
        autoFocus={autoFocus}
        placeholderTextColor={`${colors.text}80`}
        secureTextEntry={!isPasswordVisible}
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        underlineColorAndroid='transparent'
        autoCapitalize='none'
      />
      {isPasswordEnter && (
        <View style={styles.visibilityButton}>
          <IconButton
            iconName={isPasswordVisible ? icon.visibilityOn : icon.visibilityOff}
            onPress={() => setIsPasswordVisible(p => !p)}
          />
        </View>
      )}
    </View>
  )
}
