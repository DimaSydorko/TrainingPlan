import React, { useState } from 'react'
import { Text } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useAppDispatch, useUser } from '../../Hooks/redux'
import { userActionCreators } from '../../store/UserReducer/UserActionCreators'
import { useNavigation } from '@react-navigation/native'
import { ScreenName } from '../../Utils/constants'
import { ConfirmButton, MyTextInput } from '../../Common'
import { Page, TextHeader, TextOrdinary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'

export default function RegistrationScreen() {
  const dispatch = useAppDispatch()
  const { error, isLoading } = useUser()
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const [inputData, setInputData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })

  const onFooterLinkPress = () => {
    navigation.navigate(ScreenName.Login)
  }

  const onRegister = async () => {
    if (inputData.password !== inputData.confirmPassword) {
      alert('Passwords don\'t match.')
      return
    }
    dispatch(userActionCreators.signUp({
      email: inputData.email,
      password: inputData.password,
      displayName: inputData.password,
    }))
  }

  return (
    <Page style={theme.view.background}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        keyboardShouldPersistTaps='always'>
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
        <ConfirmButton disabled={isLoading} onPress={onRegister} header='Create account' />
        <Page style={theme.margin.top20}>
          <TextOrdinary>Already got an account? <Text onPress={onFooterLinkPress} style={theme.text.link}>Log in</Text></TextOrdinary>
        </Page>
      </KeyboardAwareScrollView>
    </Page>
  )
}