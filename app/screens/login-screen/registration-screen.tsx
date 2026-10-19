import * as React from 'react'
import { useState } from 'react'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useAppDispatch, useUser } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import { userAC } from '@store/user-reducer/user-ac'
import { useNavigation } from '@react-navigation/native'
import { FUTURE_FLAG, ScreenName } from '@utils/constants'
import { ConfirmButton, MyTextInput } from '@common'
import Stack from '@common/stack/stack'
import AppText from '@common/app-text/app-text'
import AppGoogleSignInButton from './app-google-sign-in-button'
import styles from './registration-screen.styles'
import { AuthNavigation } from '@utils/types'

export default function RegistrationScreen() {
  const dispatch = useAppDispatch()
  const { colors } = useAppTheme()
  const isOnline = useIsOnline()
  const { error, isLoading } = useUser()
  const navigation = useNavigation<AuthNavigation>()
  const [inputData, setInputData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })

  const onFooterLinkPress = () => {
    // React Navigation 7: navigate() no longer goes back to an existing screen; it would push a
    // second Login on top. popTo() keeps the old behaviour.
    navigation.popTo(ScreenName.Login)
  }

  const onRegister = async () => {
    if (inputData.password !== inputData.confirmPassword) {
      alert("Passwords don't match.")
      return
    }
    dispatch(
      userAC.signUp({
        email: inputData.email,
        password: inputData.password,
        displayName: inputData.password,
      })
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='always'
        bottomOffset={20}
      >
        <AppText variant='title'>{error}</AppText>
        <MyTextInput
          value={inputData.fullName}
          onChangeText={fullName => setInputData({ ...inputData, fullName })}
          placeholder='Full Name'
        />
        <MyTextInput
          value={inputData.email}
          onChangeText={email => setInputData({ ...inputData, email })}
          placeholder='E-mail'
        />
        <MyTextInput
          secureTextEntry
          value={inputData.password}
          onChangeText={password => setInputData({ ...inputData, password })}
          placeholder='Password'
        />
        <MyTextInput
          secureTextEntry
          value={inputData.confirmPassword}
          onChangeText={confirmPassword => setInputData({ ...inputData, confirmPassword })}
          placeholder='Confirm Password'
        />
        <ConfirmButton disabled={isLoading || !isOnline} onPress={onRegister} header='Create account' />
        {!FUTURE_FLAG.IS_DEV && <AppGoogleSignInButton disabled={!isOnline} />}
        <Stack preset='centerColumn' style={styles.footer}>
          <AppText>
            Already got an account?{' '}
            <AppText variant='link' color={colors.primary} onPress={onFooterLinkPress}>
              Log in
            </AppText>
          </AppText>
        </Stack>
      </KeyboardAwareScrollView>
    </View>
  )
}
