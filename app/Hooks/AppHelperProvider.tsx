import * as React from 'react'
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react'
import Tts from 'react-native-tts'
import { useSettings } from './redux'

function useAppHelper() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
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

  const onTogglePlaying = useCallback(() => {
    setIsPlaying(p => !p)
  }, [])

  const onToggleTabMenu = useCallback((isTabMenu?: boolean) => {
    if (isTabMenu === undefined) setIsTabMenu(p => !p)
    else setIsTabMenu(isTabMenu)
  }, [])

  const addSavedUids = useCallback((uid: string) => {
    setSavedUids(p => [...p, uid])
  }, [])

  return {
    isPlaying,
    isTabMenu,
    savedUids,
    onTogglePlaying,
    onToggleTabMenu,
    addSavedUids,
  }
}

export interface IContext {
  isPlaying: boolean
  isTabMenu: boolean
  savedUids: string[]
  onTogglePlaying: () => void
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
