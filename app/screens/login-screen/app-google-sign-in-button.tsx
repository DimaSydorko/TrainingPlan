import * as React from 'react'
import { View } from 'react-native'
import { memo, useEffect } from 'react'
import { GoogleSigninButton } from '@react-native-google-signin/google-signin'
import { configureGoogleSignIn } from '@platform/google-auth'
import { userAC } from '@store/user-reducer/user-ac'
import { useAppDispatch } from '@hooks/redux'
import styles from './app-google-sign-in-button.styles'

type PropsType = {
  disabled?: boolean
}

export default memo(function AppGoogleSignInButton({ disabled }: PropsType) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Client IDs come from EXPO_PUBLIC_GOOGLE_* env vars inside the googleAuth seam
    configureGoogleSignIn()
  }, [])

  const signIn = () => {
    dispatch(userAC.signInWithGoogle())
  }

  // Same look as before the migration (the library's own branded button)
  return (
    <View>
      <GoogleSigninButton
        style={styles.button}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
        disabled={disabled}
      />
    </View>
  )
})
