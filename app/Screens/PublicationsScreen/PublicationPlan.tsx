import * as React from 'react'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'
import { PublicButtons } from '../../Common'
import { Card, FlexCenterColumn, FlexSpaceBetween, Page, TextSecondary } from '../../Theme/Parents'
import { AppNavigationType, TabParamList, WorkoutType } from '../../Utils/types'
import { screen, ScreenName } from '../../Utils/constants'
import WorkoutCard from '../WorkoutsScreen/WorkoutCard'
import { useSettings } from '../../Hooks/redux'

type PropsType = NativeStackScreenProps<TabParamList, 'PublicationPlan'>

export default function PublicationPlan({ route }: PropsType) {
  const navigation = useNavigation<AppNavigationType>()
  const { colors } = useSettings()
  const { name, workouts, ownerName } = route.params.publication

  useEffect(() => {
    navigation.setOptions({ title: name })
  }, [])

  return (
    <Page>
      <FlexSpaceBetween style={{ padding: 10, paddingHorizontal: 20, width: screen.vw }}>
        <TextSecondary style={{ width: screen.vw / 2 }} color={colors.secondPrimary}>
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
              <WorkoutCard workout={workout as WorkoutType} isInPlan />
            </Card>
          </TouchableOpacity>
        ))}
      </FlexCenterColumn>
    </Page>
  )
}
