import { ReactNode, useMemo } from 'react'
import { View } from 'react-native'
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context'

import AskAiBar from '@components/ask-ai-bar/ask-ai-bar'
import styles from './ai-bar-screen-layout.styles'

export type AiBarScreenLayoutProps = {
  isAiBarVisible: boolean
  children: ReactNode
}

const AiBarScreenLayout = ({ isAiBarVisible, children }: AiBarScreenLayoutProps) => {
  const insets = useSafeAreaInsets()
  const insetsAboveAiBar = useMemo(() => ({ ...insets, bottom: 0 }), [insets])

  return (
    <View style={styles.container}>
      <SafeAreaInsetsContext.Provider value={isAiBarVisible ? insetsAboveAiBar : insets}>
        <View style={styles.content}>{children}</View>
      </SafeAreaInsetsContext.Provider>
      {isAiBarVisible && <AskAiBar bottomInset={insets.bottom} />}
    </View>
  )
}

export default AiBarScreenLayout
