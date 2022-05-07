import * as React from 'react'
import { useState } from 'react'
import { Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useAppDispatch, useSettings, useUser } from '../../Hooks/redux'
import { userActionCreators } from '../../store/UserReducer/UserActionCreators'
import { ScreenName } from '../../Utils/constants'
import { ConfirmButton, MyTextInput } from '../../Common'
import { FlexCenterColumn, Page, TextOrdinary, TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'

export default function LoginScreen() {
  const dispatch = useAppDispatch()
  const { error, isLoading } = useUser()
  const [inputData, setInputData] = useState({ email: '', password: '' })
  const navigation = useNavigation<{ navigate: (name: string) => void }>()
  const { colors } = useSettings()

  const onFooterLinkPress = () => {
    navigation.navigate(ScreenName.Registration)
  }

  const onLoginPress = async () => {
    dispatch(userActionCreators.signIn({ email: inputData.email, password: inputData.password }))
  }

  return (
    <Page style={{ backgroundColor: colors.background }}>
      <TextSecondary color={colors.error}>{error}</TextSecondary>
      <KeyboardAwareScrollView keyboardShouldPersistTaps='always'>
        <FlexCenterColumn>
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
        </FlexCenterColumn>
        <ConfirmButton disabled={isLoading} onPress={onLoginPress} header='Log in' />
        <Page style={theme.margin.top20}>
          <TextOrdinary>
            Don't have an account?{' '}
            <Text onPress={onFooterLinkPress} style={[theme.text.link, { color: colors.primary }]}>
              Sign up
            </Text>
          </TextOrdinary>
        </Page>
      </KeyboardAwareScrollView>
    </Page>
  )
}
