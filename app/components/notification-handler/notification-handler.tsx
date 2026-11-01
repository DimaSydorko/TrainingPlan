import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { useIsOnline } from '@stores/network/use-network-store'
import { useToastStore } from '@stores/toast/use-toast-store'
import { Toast, Toaster } from '@common'
import { icon } from '@theme/icons'
import { LayoutAnimation } from 'react-native'

export default memo(function NotificationHandler() {
  const errorMessage = useToastStore(state => state.errorMessage)
  const clearError = useToastStore(state => state.clearError)
  const isOnline = useIsOnline()
  const [isInternetInfo, setIsInternetInfo] = useState<boolean>(false)

  useEffect(() => {
    // for first loading
    if (isOnline) setIsInternetInfo(false)
    else setTimeout(() => setIsInternetInfo(true), 1000)
  }, [isOnline])

  return (
    <Toaster
      toasts={[
        !!errorMessage && (
          <Toast
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              clearError()
            }}
            variant='error'
            message={errorMessage}
            pressAfterTime={16000}
          />
        ),
        isInternetInfo && !isOnline && (
          <Toast
            variant='info'
            iconName={icon.wifiOff}
            message={'No internet connection'}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              setIsInternetInfo(false)
            }}
            pressAfterTime={6000}
          />
        ),
      ]}
    />
  )
})
