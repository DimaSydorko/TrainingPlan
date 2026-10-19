import * as React from 'react'
import { useState } from 'react'
import { TextInput, TextStyle, View, TextInputProps } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import { IconButton } from '../index'
import { icon } from '@theme/icons'
import { useScreen } from '@platform/screen'
import styles from './styles'
import { ORDINARY_INPUT_GUTTER } from './my-text-input.constants'

interface MyTextInputType {
  style?: TextStyle
  secureTextEntry?: boolean
  type?: 'ordinary' | 'underline' | 'secondary'
}

export default function MyTextInput({
  style,
  secureTextEntry,
  type = 'ordinary',
  ...props
}: MyTextInputType & TextInputProps) {
  const { colors } = useAppTheme()
  const isPasswordEnter = secureTextEntry !== undefined
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(isPasswordEnter ? !secureTextEntry : true)
  const { width } = useScreen()

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          type === 'ordinary' && {
            ...styles.ordinary,
            color: colors.textPrimary,
            backgroundColor: colors.surface,
          },
          type === 'ordinary' && { width: width - ORDINARY_INPUT_GUTTER },
          type === 'underline' && { ...styles.underline, color: colors.textPrimary, borderBottomColor: colors.inverse },
          type === 'secondary' && {
            ...styles.secondary,
            borderBottomColor: colors.textSecondary,
            color: colors.textSecondary,
          },
          style,
        ]}
        placeholderTextColor={`${colors.textPrimary}80`}
        secureTextEntry={!isPasswordVisible}
        underlineColorAndroid='transparent'
        autoCapitalize='none'
        {...props}
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
