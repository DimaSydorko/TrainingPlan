import * as React from 'react'
import { memo, useEffect, useMemo } from 'react'
import BackgroundService from 'react-native-background-actions'

interface IProps {
  taskName: string
  taskTitle: string
  taskDesc: string
}

export default memo(function BackgroundAction({ taskTitle, taskDesc, taskName }: IProps) {
  const veryIntensiveTask = async taskDataArguments => {
    const { delay } = taskDataArguments
    await new Promise(async () => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        console.log(i)
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
      // color: '#ff00ff',
      // progressBar: {
      //   max: 100,
      //   value: 34,
      //   indeterminate: false,
      // },
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
    BackgroundService.updateNotification({ taskDesc: options.taskDesc }).then()
    BackgroundService.updateNotification({ taskTitle: options.taskTitle }).then()
  }, [options.taskDesc, options.taskTitle])

  return null
})
