import * as React from 'react'
import { View } from 'react-native'
import { memo, useEffect } from 'react'
import { GoogleSigninButton } from '@react-native-google-signin/google-signin'
import { configureGoogleSignIn } from '../../services/googleAuth'
import { userAC } from '../../store/UserReducer/UserAC'
import { useAppDispatch } from '../../Hooks/redux'

interface IProps {
  disabled?: boolean
}

export default memo(function AppGoogleSignInButton({ disabled }: IProps) {
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
        style={{ marginLeft: 30, width: '83%', marginTop: 20, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
        disabled={disabled}
      />
    </View>
  )
})
