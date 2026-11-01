import * as React from 'react'
import { View } from 'react-native'
import { memo, useEffect } from 'react'
import { GoogleSigninButton } from '@react-native-google-signin/google-signin'
import { configureGoogleSignIn } from '@platform/google-auth'
import styles from './app-google-sign-in-button.styles'

type AppGoogleSignInButtonProps = {
  disabled?: boolean
  onPress: () => void
}

export default memo(function AppGoogleSignInButton({ disabled, onPress }: AppGoogleSignInButtonProps) {
  useEffect(() => {
    configureGoogleSignIn()
  }, [])

  return (
    <View>
      <GoogleSigninButton
        style={styles.button}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={onPress}
        disabled={disabled}
      />
    </View>
  )
})
