import * as React from 'react'
import { createContext, ReactNode, useContext, useState } from 'react'
import { SetStateType } from '@utils/types'

function usePlayTimer() {
  const [playTimer, setPlayTimer] = useState<number>(0)

  return {
    playTimer,
    setPlayTimer,
  }
}

export type PlayTimerContextType = {
  playTimer: number
  setPlayTimer: SetStateType<number>
}

export const PlayTimerContext = createContext<PlayTimerContextType>(null!)

type ProviderProps = {
  children: ReactNode
}

export function PlayTimerProvider({ children }: ProviderProps) {
  const { ...data } = usePlayTimer()
  return <PlayTimerContext.Provider value={data}>{children}</PlayTimerContext.Provider>
}

export function usePlayTimerContext() {
  const context = useContext(PlayTimerContext)
  if (!context) {
    throw new Error('usePlayTimerContext must be used within PlayTimerProvider')
  }
  return context
}
