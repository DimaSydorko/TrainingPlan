import React from 'react'
import { Text, View } from 'react-native'
import { useAppDispatch } from '../../Hooks/redux'
import { userActionCreators } from '../../store/UserReducer/UserActionCreators'
import { ConfirmButton } from '../../Common'
import { theme } from '../../Theme/theme'

export default function EmptyScreen() {
  const dispatch = useAppDispatch()

  const signOut = () => {
    dispatch(userActionCreators.signOut())
  }

  return (
    <View style={[theme.containers.centerColumn, theme.view.background]}>
      <Text>EmptyScreen</Text>
      <ConfirmButton header={'Sign out'} onPress={signOut} />
    </View>
  )
}