import * as React from 'react'
import { useEffect, useState } from 'react'
import { useSettings } from '../../Hooks/redux'
import { TextSecondary } from '../../Theme/Parents'
import { secondsToMinSec } from '../../Components/WorkoutDuration/WorkoutDuration'

interface ITimer {
  isRevers?: boolean
  isPaused?: boolean
  value?: number
}

export default function Timer({ value = 0, isPaused, isRevers = false }: ITimer) {
  const { colors } = useSettings()
  const [secondsCountDown, setSecondsCountDown] = useState<number>(value || 0)

  useEffect(() => {
    setSecondsCountDown(value)
  }, [value])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) return
      setSecondsCountDown(p => p + (isRevers ? -1 : 1))
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [isPaused])

  return <TextSecondary color={colors.text}>{secondsToMinSec(secondsCountDown, false, true)}</TextSecondary>
}
