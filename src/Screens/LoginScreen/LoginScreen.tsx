import React, {useContext, useState} from 'react'
import {Text, View} from 'react-native'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {NavigationNavigate} from "../../Utils/constants";
import {ConfirmButton, MyTextInput} from "../../Common";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider";
import styles from './LoginScreenStyles';

export default function LoginScreen({navigation}: any) {
  const [inputData, setInputData] = useState({email: '', password: ''})

  const {signIn} = useContext(AuthContext)

  const onFooterLinkPress = () => {
    navigation.navigate(NavigationNavigate.Registration)
  }

  const onLoginPress = async () => {
    await signIn(inputData.email, inputData.password)
    navigation.navigate('Home')
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
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
        <View style={styles.footerView}>
          <Text style={styles.footerText}>Don't have an account? <Text onPress={onFooterLinkPress} style={styles.footerLink}>Sign up</Text></Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}