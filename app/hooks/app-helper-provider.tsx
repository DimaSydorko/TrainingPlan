import * as React from 'react'
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react'
import { setSpeechDefaults } from '@platform/speech'
import { useSettings } from './redux'

function useAppHelper() {
  const [isTabMenu, setIsTabMenu] = useState<boolean>(true)
  const [savedUids, setSavedUids] = useState<string[]>([])

  const {
    tts: { isDucking, pitch, rate },
  } = useSettings()

  useEffect(() => {
    setSpeechDefaults({ rate })
  }, [rate])

  useEffect(() => {
    setSpeechDefaults({ pitch })
  }, [pitch])

  useEffect(() => {
    setSpeechDefaults({ duck: isDucking })
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
