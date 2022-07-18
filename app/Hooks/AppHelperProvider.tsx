import * as React from 'react'
import { createContext, ReactNode, useCallback, useState } from 'react'

function useAppHelper() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isTabMenu, setIsTabMenu] = useState<boolean>(true)

  const onTogglePlaying = useCallback(() => {
    setIsPlaying(p => !p)
  }, [])

  const onToggleTabMenu = useCallback((isTabMenu?: boolean) => {
    if (isTabMenu === undefined) setIsTabMenu(p => !p)
    else setIsTabMenu(isTabMenu)
  }, [])

  return {
    isPlaying,
    isTabMenu,
    onTogglePlaying,
    onToggleTabMenu,
  }
}

export interface IContext {
  isPlaying: boolean
  isTabMenu: boolean
  onTogglePlaying: () => void
  onToggleTabMenu: (arg?: boolean) => void
}

export const AppHelperContext = createContext<IContext>(null!)

interface IProvider {
  children: ReactNode
}

export default function AppHelperProvider({ children }: IProvider) {
  const { ...playData } = useAppHelper()
  return <AppHelperContext.Provider value={playData}>{children}</AppHelperContext.Provider>
}
