import { memo } from 'react'
import { PlayTimerProvider } from './components/PlayTimerProvider'
import PlayingScreen from './PlayingScreen'
import * as React from 'react'

export default memo(function PlayingScreenWithTimer() {
  return (
    <PlayTimerProvider>
      <PlayingScreen />
    </PlayTimerProvider>
  )
})
