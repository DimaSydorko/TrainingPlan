import * as React from 'react'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useAppDispatch, useSettings, useUser } from '../../Hooks/redux'
import { userAC } from '../../store/UserReducer/UserAC'
import { FUTURE_FLAG, ScreenName } from '../../Utils/constants'
import { ConfirmButton, MyTextInput } from '../../Common'
import { FlexCenterColumn, TextOrdinary, TextSecondary } from '../../Theme/Parents'
import { theme } from '../../Theme/theme'
import AppGoogleSignInButton from './AppGoogleSignInButton'
import { AuthNavigation } from '../../Utils/types'

export default function LoginScreen() {
  const dispatch = useAppDispatch()
  const { error, isLoading } = useUser()
  const [inputData, setInputData] = useState({ email: '', password: '' })
  const navigation = useNavigation<AuthNavigation>()
  const { colors, internet } = useSettings()

  const onFooterLinkPress = () => {
    navigation.navigate(ScreenName.Registration)
  }

  const onLoginPress = async () => {
    dispatch(userAC.signIn({ email: inputData.email, password: inputData.password }))
  }

  return (
    // KeyboardAwareScrollView is the scroller here (it was nested in Page's ScrollView before, which
    // left it with nothing to scroll). react-native-keyboard-controller works with edge-to-edge.
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TextSecondary color={colors.error}>{error}</TextSecondary>
      <KeyboardAwareScrollView keyboardShouldPersistTaps='always' bottomOffset={20}>
        <FlexCenterColumn>
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
        </FlexCenterColumn>
        <ConfirmButton
          disabled={isLoading || !internet.isOnline}
          onPress={onLoginPress}
          header='Log in'
          testID='login.submit'
        />
        {!FUTURE_FLAG.IS_DEV && <AppGoogleSignInButton disabled={!internet.isOnline} />}
        <FlexCenterColumn style={theme.margin.top20}>
          <TextOrdinary>
            Don&apos;t have an account?{' '}
            <Text onPress={onFooterLinkPress} style={[theme.text.link, { color: colors.primary }]}>
              Sign up
            </Text>
          </TextOrdinary>
        </FlexCenterColumn>
      </KeyboardAwareScrollView>
    </View>
  )
}
