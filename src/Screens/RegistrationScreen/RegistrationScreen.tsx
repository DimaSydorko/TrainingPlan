import React, {useContext, useState} from 'react'
import {Text, View} from 'react-native'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {AuthContext} from "../../Providers/AuthProvider/AuthProvider";
import {ScreenName} from "../../Utils/constants";
import {ConfirmButton, MyTextInput} from "../../Common";
import {theme} from "../../Theme/theme";

export default function RegistrationScreen({navigation}: any) {
  const [inputData, setInputData] = useState({fullName: '', email: '', password: '', confirmPassword: ''})
  const {signUp} = useContext(AuthContext)

  const onFooterLinkPress = () => {
    navigation.navigate(ScreenName.Login)
  }

  const onRegister = async () => {
    if (inputData.password !== inputData.confirmPassword) {
      alert("Passwords don't match.")
      return
    }
    signUp(inputData.email, inputData.password, inputData.fullName)
    navigation.navigate(ScreenName.Home)
  }

  return (
    <View style={[theme.container, theme.background]}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        keyboardShouldPersistTaps="always">
        <MyTextInput
          value={inputData.fullName}
          onChangeText={fullName => setInputData({...inputData, fullName})}
          placeholder='Full Name'
        />
        <MyTextInput
          value={inputData.email}
          onChangeText={email => setInputData({...inputData, email})}
          placeholder='E-mail'
        />
        <MyTextInput
          secureTextEntry
          value={inputData.password}
          onChangeText={password => setInputData({...inputData, password})}
          placeholder='Password'
        />
        <MyTextInput
          secureTextEntry
          value={inputData.confirmPassword}
          onChangeText={confirmPassword => setInputData({...inputData, confirmPassword})}
          placeholder='Confirm Password'
        />
        <ConfirmButton onPress={onRegister} header='Create account'/>
        <View style={[theme.container, theme.margin.top20]}>
          <Text style={theme.text}>Already got an account? <Text onPress={onFooterLinkPress} style={theme.link}>Log in</Text></Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}