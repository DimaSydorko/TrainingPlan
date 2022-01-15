import React, {useContext, useState} from 'react'
import {Text, View} from 'react-native'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {AsyncStorageKey, ScreenName} from "../../Utils/constants";
import {ConfirmButton, MyTextInput} from "../../Common";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider";
import {userInitialState} from "../../../constants.local";
import {asyncStorage} from "../../Utils/asyncStarage";
import {theme} from "../../Theme/theme";

export default function LoginScreen({navigation}: any) {
  const [inputData, setInputData] = useState({email: '', password: ''})

  const {signIn} = useContext(AuthContext)

  const onFooterLinkPress = () => {
    navigation.navigate(ScreenName.Registration)
  }

  const onLoginPress = async () => {
    await signIn(inputData.email, inputData.password)
  }

  //TODO Remove LoginInitial before release
  const onLoginInitial = async () => {
    await asyncStorage.set(AsyncStorageKey.user, userInitialState)
  }

  return (
    <View style={[theme.container, theme.background]}>
      <KeyboardAwareScrollView
        style={{flex: 1, width: '100%'}}
        keyboardShouldPersistTaps="always"
      >
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
        <ConfirmButton onPress={onLoginPress} header='Log in'/>
        <ConfirmButton onPress={onLoginInitial} header='Log in Phone'/>
        <View style={[theme.container, theme.margin.top20]}>
          <Text style={theme.text}>Don't have an account? <Text onPress={onFooterLinkPress}
                                                                style={theme.link}>Sign up</Text></Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}