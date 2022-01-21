import React, {useContext} from 'react'
import { Text, View } from 'react-native'
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider";
import {ConfirmButton} from "../../Common";
import {theme} from "../../Theme/theme";

export default function EmptyScreen() {
  const { signOut } = useContext(AuthContext)

  return (
    <View style={[theme.containers.center, theme.view.background]}>
      <Text>EmptyScreen</Text>
      <ConfirmButton header={'Sign out'} onPress={() => signOut()} />
    </View>
  )
}