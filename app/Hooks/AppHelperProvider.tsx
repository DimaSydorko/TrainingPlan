import * as React from 'react'
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react'
import Tts from 'react-native-tts'
import { useSettings } from './redux'

function useAppHelper() {
  const [isTabMenu, setIsTabMenu] = useState<boolean>(true)
  const [savedUids, setSavedUids] = useState<string[]>([])

  const {
    tts: { isDucking, pitch, rate },
  } = useSettings()

  useEffect(() => {
    Tts.setDefaultRate(rate)
  }, [rate])

  useEffect(() => {
    Tts.setDefaultPitch(pitch)
  }, [pitch])

  useEffect(() => {
    Tts.setDucking(isDucking)
  }, [isDucking])

  const onToggleTabMenu = useCallback((isTabMenu?: boolean) => {
    if (isTabMenu === undefined) setIsTabMenu(p => !p)
    else setIsTabMenu(isTabMenu)
  }, [])

  const addSavedUids = useCallback((uid: string) => {
    setSavedUids(p => [...p, uid])
  }, [])

  return {
    isTabMenu,
    savedUids,
    onToggleTabMenu,
    addSavedUids,
  }
}

export interface IContext {
  isTabMenu: boolean
  savedUids: string[]
  onToggleTabMenu: (arg?: boolean) => void
  addSavedUids: (uid: string) => void
}

export const AppHelperContext = createContext<IContext>(null!)

interface IProvider {
  children: ReactNode
}

export default function AppHelperProvider({ children }: IProvider) {
  const { ...playData } = useAppHelper()
  return <AppHelperContext.Provider value={playData}>{children}</AppHelperContext.Provider>
}
