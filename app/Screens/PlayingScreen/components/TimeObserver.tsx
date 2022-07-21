import * as React from 'react'
import { usePlayTimerContext } from './PlayTimerProvider'
import { memo, useEffect } from 'react'

interface IProps {
  time: number
}

export default memo(function TimeObserver({ time }: IProps) {
  const { setPlayTimer } = usePlayTimerContext()

  useEffect(() => {
    setPlayTimer(time)
  }, [time])

  return null
})
