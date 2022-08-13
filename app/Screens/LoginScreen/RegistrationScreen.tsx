import * as React from 'react'
import { useState } from 'react'
import { Text } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useAppDispatch, useSettings, useUser } from '../../Hooks/redux'
import { userAC } from '../../store/UserReducer/UserAC'
import { useNavigation } from '@react-navigation/native'
import { FUTURE_FLAG, ScreenName } from '../../Utils/constants'
import { ConfirmButton, MyTextInput } from '../../Common'
import { Page, TextHeader, TextOrdinary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'
import AppGoogleSignInButton from './AppGoogleSignInButton'
import { AppNavigationType } from '../../Utils/types'

export default function RegistrationScreen() {
  const dispatch = useAppDispatch()
  const { colors, internet } = useSettings()
  const { error, isLoading } = useUser()
  const navigation = useNavigation<AppNavigationType>()
  const [inputData, setInputData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })

  const onFooterLinkPress = () => {
    navigation.navigate(ScreenName.Login)
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
    <Page style={{ backgroundColor: colors.background }}>
      <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }} keyboardShouldPersistTaps='always'>
        <TextHeader>{error}</TextHeader>
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
        <ConfirmButton disabled={isLoading || !internet.isOnline} onPress={onRegister} header='Create account' />
        {!FUTURE_FLAG.IS_DEV && <AppGoogleSignInButton disabled={!internet.isOnline} />}
        <Page style={theme.margin.top20}>
          <TextOrdinary>
            Already got an account?{' '}
            <Text onPress={onFooterLinkPress} style={[theme.text.link, { color: colors.primary }]}>
              Log in
            </Text>
          </TextOrdinary>
        </Page>
      </KeyboardAwareScrollView>
    </Page>
  )
}
