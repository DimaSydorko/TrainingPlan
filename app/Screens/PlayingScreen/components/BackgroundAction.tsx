import * as React from 'react'
import { memo, useEffect } from 'react'
import { startSession, stopSession, updateSession } from '../../../services/backgroundSession'
import { usePlayTimerContext } from './PlayTimerProvider'
import { useSettings } from '../../../Hooks/redux'

interface IProps {
  taskName: string
  taskTitle: string
  taskDesc: string
  color?: string
  duration?: number
}

export default memo(function BackgroundAction({ taskTitle, taskDesc, taskName, duration, color }: IProps) {
  const { playTimer } = usePlayTimerContext()
  const { colors } = useSettings()

  const newColor = color || colors.secondPrimary

  // TODO(A4): the old react-native-background-actions task (taskName, mipmap ic_launcher icon,
  // 1s keep-alive loop, linkingURI 'yourSchemeHere://chat/jane') moves into backgroundSession.ts.
  useEffect(() => {
    startSession({
      title: taskTitle,
      description: taskDesc,
      color: newColor,
      ...(duration !== undefined ? { progress: { value: 100, max: 100 } } : {}),
    }).then()
    return () => {
      stopSession().then()
    }
  }, [])

  useEffect(() => {
    updateSession({ description: taskDesc }).then()
  }, [taskDesc])

  useEffect(() => {
    updateSession({ title: taskTitle }).then()
  }, [taskTitle])

  useEffect(() => {
    updateSession({ color: newColor }).then()
  }, [newColor])

  useEffect(() => {
    duration !== undefined &&
      updateSession({
        progress: {
          value: playTimer,
          max: duration,
        },
      }).then()
  }, [playTimer, duration])

  return null
})
