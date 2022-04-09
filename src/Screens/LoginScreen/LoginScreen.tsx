import React, { useState } from 'react'
import { Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useAppDispatch, useUser } from '../../Hooks/redux'
import { userActionCreators } from '../../store/UserReducer/UserActionCreators'
import { ScreenName } from '../../Utils/constants'
import { ConfirmButton, MyTextInput } from '../../Common'
import { theme } from '../../Theme/theme'
import { Page, TextOrdinary } from '../../Theme/Parents'

export default function LoginScreen() {
  const dispatch = useAppDispatch()
  const { error, isLoading } = useUser()
  const [inputData, setInputData] = useState({ email: '', password: '' })
  const navigation = useNavigation<{ navigate: (name: string) => void }>()

  const onFooterLinkPress = () => {
    navigation.navigate(ScreenName.Registration)
  }

  const onLoginPress = async () => {
    dispatch(userActionCreators.signIn({ email: inputData.email, password: inputData.password }))
  }

  return (
    <Page style={theme.view.background}>
      <Text>{error}</Text>
      <KeyboardAwareScrollView keyboardShouldPersistTaps='always'>
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
        <ConfirmButton disabled={isLoading} onPress={onLoginPress} header='Log in' />
        <Page style={theme.margin.top20}>
          <TextOrdinary>Don't have an account? <Text onPress={onFooterLinkPress}
                                                     style={theme.text.link}>Sign up</Text></TextOrdinary>
        </Page>
      </KeyboardAwareScrollView>
    </Page>
  )
}