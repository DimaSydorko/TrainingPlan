import { memo } from 'react'
import { PlayTimerProvider } from './components/PlayTimerProvider'
import PlayingScreen from './PlayingScreen'
import * as React from 'react'

export default memo(() => {
  return (
    <PlayTimerProvider>
      <PlayingScreen />
    </PlayTimerProvider>
  )
})
