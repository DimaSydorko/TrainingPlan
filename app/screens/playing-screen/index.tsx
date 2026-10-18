import { memo } from 'react'
import { PlayTimerProvider } from './components/play-timer-provider'
import PlayingScreen from './playing-screen'
import * as React from 'react'

export default memo(function PlayingScreenWithTimer() {
  return (
    <PlayTimerProvider>
      <PlayingScreen />
    </PlayTimerProvider>
  )
})
