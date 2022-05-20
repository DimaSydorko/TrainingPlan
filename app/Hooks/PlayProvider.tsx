import * as React from 'react'
import { createContext, ReactNode, useCallback, useState } from 'react'

function usePlay() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const onTogglePlaying = useCallback(() => {
    setIsPlaying(p => !p)
  }, [])

  return {
    isPlaying,
    onTogglePlaying
  }
}

export interface IPlayContext {
  isPlaying: boolean
  onTogglePlaying: () => void
}

export const PlayContext = createContext<IPlayContext>(null!)
interface ProviderProps {
  children: ReactNode
}
export default function PlayProvider({ children }: ProviderProps) {
  const { ...playData } = usePlay()
  return <PlayContext.Provider value={playData}>{children}</PlayContext.Provider>
}
