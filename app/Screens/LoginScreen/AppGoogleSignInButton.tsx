import * as React from 'react'
import { View } from 'react-native'
import { memo, useEffect } from 'react'
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin'
import { GOOGLE_WEB_CLIENT_ID } from '../../Utils/constants.local'
import { userAC } from '../../store/UserReducer/UserActionCreator'
import { useAppDispatch } from '../../Hooks/redux'

interface IProps {
  disabled?: boolean
}

export default memo(function AppGoogleSignInButton({ disabled }: IProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    })
  }, [])

  const signIn = () => {
    dispatch(userAC.signInWithGoogle())
  }

  return (
    <View>
      <GoogleSigninButton
        style={{
          marginLeft: 30,
          width: '83%',
          marginTop: 20,
          height: 48,
        }}
        disabled={disabled}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
      />
    </View>
  )
})
