import * as React from 'react'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { useAppTheme } from '@theme/use-app-theme'
import PublicButtons from '@components/publication/public-buttons'
import { PublicationScreensParamList, WorkoutType } from '@utils/types'
import { ScreenName } from '@utils/constants'
import { Card, FlexCenterColumn, FlexSpaceBetween, Page, TextSecondary } from '@theme/parents'
import WorkoutCard from '../workouts-screen/workout-card'
import { useScreen } from '@platform/screen'
import styles from './publication-details.styles'
import { OWNER_NAME_WIDTH_RATIO } from './publication-details.constants'

type PropsType = StackScreenProps<PublicationScreensParamList, ScreenName.PublicationPlan>

export default function PublicationPlan({ route, navigation }: PropsType) {
  const { colors } = useAppTheme()
  const { name, workouts, ownerName } = route.params.publication
  const { width } = useScreen()

  useEffect(() => {
    navigation.setOptions({ title: name })
  }, [])

  return (
    <Page>
      <FlexSpaceBetween style={[styles.header, { width }]}>
        <TextSecondary style={{ width: width * OWNER_NAME_WIDTH_RATIO }} color={colors.accent}>
          By {ownerName}
        </TextSecondary>
        <PublicButtons isOpenedScreen publication={route.params.publication} />
      </FlexSpaceBetween>
      <FlexCenterColumn style={{ padding: 0 }}>
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
      </FlexCenterColumn>
    </Page>
  )
}
