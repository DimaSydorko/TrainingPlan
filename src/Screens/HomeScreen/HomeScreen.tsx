import React, {useContext} from 'react'
import { Text, View } from 'react-native'
import {theme} from "../../Theme/theme";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider";
import {ConfirmButton} from "../../Common";

export default function HomeScreen() {
  const { signOut } = useContext(AuthContext)

  return (
    <View style={[theme.container, theme.background]}>
      <Text>Home Screen</Text>
      <ConfirmButton header={'Sign out'} onPress={() => signOut()} />
    </View>
  )
}