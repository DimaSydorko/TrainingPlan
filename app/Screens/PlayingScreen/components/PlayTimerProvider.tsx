import * as React from 'react'
import { createContext, ReactNode, useContext, useState } from 'react'
import { SetStateType } from '../../../Utils/types'

function usePlayTimer() {
  const [playTimer, setPlayTimer] = useState<number>(0)

  return {
    playTimer,
    setPlayTimer,
  }
}

export interface IContext {
  playTimer: number
  setPlayTimer: SetStateType<number>
}

export const PlayTimerContext = createContext<IContext>(null!)

interface IProvider {
  children: ReactNode
}

export function PlayTimerProvider({ children }: IProvider) {
  const { ...data } = usePlayTimer()
  return <PlayTimerContext.Provider value={data}>{children}</PlayTimerContext.Provider>
}

export function usePlayTimerContext() {
  const context = useContext(PlayTimerContext)
  if (!context) {
    throw new Error('useBackgroundActionContext must be used within BackgroundActionProvider')
  }
  return context
}
