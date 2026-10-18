import * as React from 'react'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSettings } from '../../hooks/redux'
import PublicButtons from '../../components/publication/public-buttons'
import { PublicationScreensParamList, WorkoutType } from '../../utils/types'
import { appScreen, ScreenName } from '../../utils/constants'
import { Card, FlexCenterColumn, FlexSpaceBetween, Page, TextSecondary } from '../../theme/parents'
import WorkoutCard from '../workouts-screen/workout-card'

type PropsType = StackScreenProps<PublicationScreensParamList, ScreenName.PublicationPlan>

export default function PublicationPlan({ route, navigation }: PropsType) {
  const { colors } = useSettings()
  const { name, workouts, ownerName } = route.params.publication

  useEffect(() => {
    navigation.setOptions({ title: name })
  }, [])

  return (
    <Page>
      <FlexSpaceBetween style={{ padding: 10, paddingHorizontal: 20, width: appScreen.vw }}>
        <TextSecondary style={{ width: appScreen.vw / 2 }} color={colors.secondPrimary}>
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
