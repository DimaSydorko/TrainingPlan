import { usePlayTimerContext } from './play-timer-provider'
import { memo, useEffect } from 'react'

type PropsType = {
  time: number
}

export default memo(function TimeObserver({ time }: PropsType) {
  const { setPlayTimer } = usePlayTimerContext()

  useEffect(() => {
    setPlayTimer(time)
  }, [time])

  return null
})
