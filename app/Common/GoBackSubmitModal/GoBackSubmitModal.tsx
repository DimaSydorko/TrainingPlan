import * as React from 'react'
import { memo, useEffect } from 'react'
import { Alert, BackHandler, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

interface IGoBackSubmitModal {
  title?: string
  text: string
  confirmText?: string
}

export default memo(function GoBackSubmitModal({
  title = 'Are you sure you want to go back?',
  text,
  confirmText = 'YES'
}: IGoBackSubmitModal) {
  const navigation = useNavigation()

  useEffect(() => {
    const backAction = () => {
      Alert.alert(title, text, [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel'
        },
        { text: confirmText, onPress: () => BackHandler.exitApp() }
      ])
      return true
    }
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, [])

  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        e.preventDefault()
        Alert.alert(title, text, [
          { text: 'Cancel', style: 'cancel', onPress: () => null },
          {
            text: 'YES',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action)
          }
        ])
      }),
    [navigation]
  )

  return <View />
})
