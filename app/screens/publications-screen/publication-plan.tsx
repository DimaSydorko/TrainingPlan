import * as React from 'react'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import PublicButtons from '@components/publication/public-buttons'
import { PublicationScreensParamList, WorkoutType } from '@utils/types'
import { ScreenName } from '@utils/constants'
import Card from '@common/card/card'
import Stack from '@common/stack/stack'
import Screen from '@common/screen/screen'
import AppText from '@common/app-text/app-text'
import WorkoutCard from '../workouts-screen/workout-card'
import { useScreen } from '@platform/screen'
import styles from './publication-details.styles'
import { OWNER_NAME_WIDTH_RATIO } from './publication-details.constants'

type PropsType = StackScreenProps<PublicationScreensParamList, ScreenName.PublicationPlan>

export default function PublicationPlan({ route, navigation }: PropsType) {
  const { name, workouts, ownerName } = route.params.publication
  const { width } = useScreen()

  useEffect(() => {
    navigation.setOptions({ title: name })
  }, [])

  return (
    <Screen>
      <Stack preset='spaceBetween' style={[styles.header, { width }]}>
        <AppText variant='caption' tone='accent' style={{ width: width * OWNER_NAME_WIDTH_RATIO }}>
          By {ownerName}
        </AppText>
        <PublicButtons isOpenedScreen publication={route.params.publication} />
      </Stack>
      <Stack preset='centerColumn' style={styles.list}>
        {workouts.map(workout => (
          <TouchableOpacity
            key={workout.uid}
            onPress={() => navigation.navigate(ScreenName.PublicationWorkout, { workout: workout as WorkoutType })}
          >
            <Card>
              <WorkoutCard workout={workout as WorkoutType} />
            </Card>
          </TouchableOpacity>
        ))}
      </Stack>
    </Screen>
  )
}
