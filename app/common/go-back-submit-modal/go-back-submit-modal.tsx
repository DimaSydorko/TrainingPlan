import * as React from 'react'
import { memo, useEffect, useRef } from 'react'
import { Alert, BackHandler, View } from 'react-native'
import { EventArg, NavigationAction, useNavigation } from '@react-navigation/native'
import { AppNavigationType } from '@utils/types'

type GoBackSubmitModalProps = {
  title?: string
  text: string
  confirmText?: string
  onConfirm?: () => void
}

/**
 * Asks for confirmation before leaving a screen with unsaved changes. Mounted only while there are
 * unsaved changes. Covers the Android hardware back button and every navigation that removes the
 * screen (header back button, swipe back, goBack()).
 */
export default memo(function GoBackSubmitModal({
  title = 'Are you sure you want to go back?',
  text,
  confirmText = 'YES',
  onConfirm,
}: GoBackSubmitModalProps) {
  const navigation = useNavigation<AppNavigationType>()
  // Set once the user confirmed, so the navigation that follows (onConfirm usually calls goBack())
  // is not stopped again by the beforeRemove listener, which is still mounted until the next render.
  const isConfirmed = useRef(false)

  useEffect(() => {
    const backAction = () => {
      Alert.alert(title, text, [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: () => {
            isConfirmed.current = true
            if (onConfirm) onConfirm()
            else BackHandler.exitApp()
          },
        },
      ])
      return true
    }
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    // The event is typed by hand: with `strict: false` React Navigation's inferred beforeRemove type
    // loses `preventDefault` (`undefined extends true` holds without strictNullChecks).
    const onBeforeRemove = (e: EventArg<'beforeRemove', true, { action: NavigationAction }>) => {
      if (isConfirmed.current) return
      e.preventDefault()
      Alert.alert(title, text, [
        { text: 'Cancel', style: 'cancel', onPress: () => null },
        {
          text: 'YES',
          style: 'destructive',
          onPress: () => {
            isConfirmed.current = true
            if (onConfirm) onConfirm()
            else navigation.dispatch(e.data.action)
          },
        },
      ])
    }
    return navigation.addListener('beforeRemove', onBeforeRemove)
  }, [navigation])

  return <View />
})
