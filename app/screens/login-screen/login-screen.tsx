import * as React from 'react'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useAppDispatch, useUser } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useIsOnline } from '@stores/network/use-network-store'
import { userAC } from '@store/user-reducer/user-ac'
import { FUTURE_FLAG, ScreenName } from '@utils/constants'
import { ConfirmButton, MyTextInput } from '@common'
import { FlexCenterColumn, TextOrdinary, TextSecondary } from '@theme/parents'
import { theme } from '@theme/theme'
import AppGoogleSignInButton from './app-google-sign-in-button'
import { AuthNavigation } from '@utils/types'

export default function LoginScreen() {
  const dispatch = useAppDispatch()
  const { error, isLoading } = useUser()
  const [inputData, setInputData] = useState({ email: '', password: '' })
  const navigation = useNavigation<AuthNavigation>()
  const { colors } = useAppTheme()
  const isOnline = useIsOnline()

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
      <TextSecondary color={colors.danger}>{error}</TextSecondary>
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
        <ConfirmButton disabled={isLoading || !isOnline} onPress={onLoginPress} header='Log in' testID='login.submit' />
        {!FUTURE_FLAG.IS_DEV && <AppGoogleSignInButton disabled={!isOnline} />}
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
