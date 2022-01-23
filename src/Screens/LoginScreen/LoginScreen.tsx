import React, {useContext, useState} from 'react'
import {Text, View} from 'react-native'
import {useNavigation} from "@react-navigation/native";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {AsyncStorageKey, ScreenName} from "../../Utils/constants";
import {ConfirmButton, MyTextInput} from "../../Common";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider";
import {userInitialState} from "../../../constants.local";
import {asyncStorage} from "../../Utils/asyncStarage";
import {theme} from "../../Theme/theme";
import {Page, TextOrdinary} from "../../Theme/Parents";

export default function LoginScreen() {
  const [inputData, setInputData] = useState({email: '', password: ''})
  const navigation = useNavigation<{ navigate: (name: string) => void }>()

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
    <Page style={theme.view.background}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
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
        <Page style={theme.margin.top20}>
          <TextOrdinary>Don't have an account? <Text onPress={onFooterLinkPress}
                                                     style={theme.text.link}>Sign up</Text></TextOrdinary>
        </Page>
      </KeyboardAwareScrollView>
    </Page>
  )
}