import * as React from 'react'
import { View } from 'react-native'
import { memo, useEffect } from 'react'
import { configureGoogleSignIn } from '../../services/googleAuth'
import { userAC } from '../../store/UserReducer/UserAC'
import { useAppDispatch } from '../../Hooks/redux'
import { ConfirmButton } from '../../Common'

interface IProps {
  disabled?: boolean
}

export default memo(function AppGoogleSignInButton({ disabled }: IProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // webClientId, offlineAccess and forceCodeForRefreshToken now live in the googleAuth seam (A2)
    configureGoogleSignIn()
  }, [])

  const signIn = () => {
    dispatch(userAC.signInWithGoogle())
  }

  // TODO(A2): temporary button. The library's GoogleSigninButton (Size.Wide, Color.Dark,
  // style { marginLeft: 30, width: '83%', marginTop: 20, height: 48 }) was removed with the package.
  return (
    <View>
      <ConfirmButton header={'Sign in with Google'} disabled={disabled} onPress={signIn} style={{ marginTop: 20 }} />
    </View>
  )
})
