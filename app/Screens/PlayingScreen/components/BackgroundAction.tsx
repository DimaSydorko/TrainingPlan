import * as React from 'react'
import { memo, useEffect, useMemo } from 'react'
import BackgroundService from 'react-native-background-actions'
import { usePlayTimerContext } from './PlayTimerProvider'
import { useSettings } from '../../../Hooks/redux'

interface IProps {
  taskName: string
  taskTitle: string
  taskDesc: string
  duration?: number
}

export default memo(function BackgroundAction({ taskTitle, taskDesc, taskName, duration }: IProps) {
  const { playTimer } = usePlayTimerContext()
  const { colors } = useSettings()

  const veryIntensiveTask = async taskDataArguments => {
    const { delay } = taskDataArguments
    await new Promise(async () => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        // console.log(i)
        await new Promise(r => setTimeout(r, delay))
      }
    })
  }

  const options = useMemo(
    () => ({
      taskName,
      taskTitle,
      taskDesc,
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      parameters: {
        delay: 1000,
      },
      // linkingURI: 'yourSchemeHere://chat/jane',
      color: colors.secondPrimary,
      ...(duration !== undefined
        ? {
            progressBar: {
              value: 100,
              max: 100,
              indeterminate: false,
            },
          }
        : {}),
    }),
    [taskName, taskTitle, taskDesc]
  )

  useEffect(() => {
    BackgroundService.start(veryIntensiveTask, options).then()
    return () => {
      BackgroundService.stop().then()
    }
  }, [])

  useEffect(() => {
    BackgroundService.updateNotification({ taskDesc }).then()
    BackgroundService.updateNotification({ taskTitle }).then()
  }, [taskDesc, taskTitle])

  useEffect(() => {
    duration !== undefined &&
      BackgroundService.updateNotification({
        progressBar: {
          value: playTimer,
          max: duration,
          indeterminate: false,
        },
      }).then()
  }, [playTimer, duration])

  return null
})
