import * as React from 'react'
import { useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import styles from './infinite-scroll.styles'

type InfiniteScrollProps = {
  children: React.ReactNode
  onScrollToBottom?: () => void
  isLoading?: boolean
  onRefresh?: () => void
}

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  return layoutMeasurement.height + contentOffset.y >= contentSize.height
}

export default function InfiniteScroll({
  children,
  isLoading = false,
  onScrollToBottom,
  onRefresh,
}: InfiniteScrollProps) {
  const [isRefreshLoading, setIsRefreshLoading] = useState<boolean>(false)
  const [isDelay, setIsDelay] = useState<boolean>(false)
  const { colors } = useAppTheme()

  useEffect(() => {
    if (!isLoading) setIsRefreshLoading(p => (p ? false : p))
  }, [isLoading])

  const _onRefresh = () => {
    setIsRefreshLoading(true)
    onRefresh()
  }

  const _onScrollToBottom = () => {
    if (!isDelay && onScrollToBottom) {
      onScrollToBottom()
      setIsDelay(true)
      setTimeout(() => setIsDelay(p => (p ? false : p)), 100)
    }
  }

  return (
    <ScrollView
      centerContent
      style={[styles.container, { backgroundColor: colors.background }]}
      onScroll={e => isCloseToBottom(e.nativeEvent) && _onScrollToBottom()}
      scrollEventThrottle={100}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={isLoading && isRefreshLoading} onRefresh={_onRefresh} /> : undefined
      }
    >
      {children}
      {isLoading && !isRefreshLoading && <ActivityIndicator size='large' color={colors.accent} />}
    </ScrollView>
  )
}
