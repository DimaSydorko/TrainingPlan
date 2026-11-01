import * as React from 'react'
import { useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import useSignIn from '@services/auth/use-sign-in'
import useGoogleSignIn from '@services/auth/use-google-sign-in'
import { FUTURE_FLAG, ScreenName } from '@utils/constants'
import { ConfirmButton, MyTextInput } from '@common'
import Stack from '@common/stack/stack'
import AppText from '@common/app-text/app-text'
import AuthErrorText from './auth-error-text'
import AppGoogleSignInButton from './app-google-sign-in-button'
import styles from './login-screen.styles'
import { AuthNavigation } from '@utils/types'

export default function LoginScreen() {
  const signIn = useSignIn()
  const googleSignIn = useGoogleSignIn()
  const [inputData, setInputData] = useState({ email: '', password: '' })
  const navigation = useNavigation<AuthNavigation>()
  const { colors } = useAppTheme()
  const isOnline = useIsOnline()

  const onFooterLinkPress = () => {
    navigation.navigate(ScreenName.Registration)
  }

  const isPending = signIn.isPending || googleSignIn.isPending

  const handleLoginPress = () => {
    googleSignIn.reset()
    signIn.mutate({ email: inputData.email, password: inputData.password })
  }

  const handleGooglePress = () => {
    signIn.reset()
    googleSignIn.mutate()
  }

  return (
    // KeyboardAwareScrollView is the scroller here (it was nested in Page's ScrollView before, which
    // left it with nothing to scroll). react-native-keyboard-controller works with edge-to-edge.
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AuthErrorText error={signIn.error ?? googleSignIn.error} />
      <KeyboardAwareScrollView keyboardShouldPersistTaps='always' bottomOffset={20}>
        <Stack preset='centerColumn'>
          <MyTextInput
            value={inputData.email}
            onChangeText={email => setInputData({ ...inputData, email })}
            placeholder='E-mail'
            testID='login.email'
          />
          <MyTextInput
            secureTextEntry
            value={inputData.password}
            onChangeText={password => setInputData({ ...inputData, password })}
            placeholder='Password'
            testID='login.password'
          />
        </Stack>
        <ConfirmButton
          disabled={isPending || !isOnline}
          onPress={handleLoginPress}
          header='Log in'
          testID='login.submit'
        />
        {!FUTURE_FLAG.IS_DEV && <AppGoogleSignInButton disabled={isPending || !isOnline} onPress={handleGooglePress} />}
        <Stack preset='centerColumn' style={styles.footer}>
          <AppText>
            Don&apos;t have an account?{' '}
            <AppText variant='link' color={colors.primary} onPress={onFooterLinkPress}>
              Sign up
            </AppText>
          </AppText>
        </Stack>
      </KeyboardAwareScrollView>
    </View>
  )
}
