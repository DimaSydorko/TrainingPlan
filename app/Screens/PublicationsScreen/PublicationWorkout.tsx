import * as React from 'react'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'
import { useSettings } from '../../Hooks/redux'
import { PublicButtons, WorkoutDuration } from '../../Common'
import { Card, FlexCenterColumn, FlexSpaceBetween, Page, TextSecondary } from '../../Theme/Parents'
import { AppNavigationType, PublicType, TabParamList } from '../../Utils/types'
import Exercise from '../../Components/Exercise/Exercise'
import { COLORS_EXERCISE, colorsDark } from '../../Theme/colors'
import { screen } from '../../Utils/constants'

type PropsType = NativeStackScreenProps<TabParamList, 'PublicationWorkout'>

export default function PublicationWorkout({ route }: PropsType) {
  const navigation = useNavigation<AppNavigationType>()
  const { colors } = useSettings()
  const { name, exercises, ownerName } = route.params.workout
  const isDarkTheme = colors.primary === colorsDark.primary

  useEffect(() => {
    navigation.setOptions({ title: name })
  }, [])

  return (
    <Page>
      <FlexSpaceBetween style={{ padding: 10, paddingHorizontal: 20, width: screen.vw }}>
        <FlexCenterColumn style={{ alignItems: 'flex-start' }}>
          {!!ownerName && (
            <TextSecondary style={{ width: screen.vw / 2 }} color={colors.primary}>
              By {ownerName}
            </TextSecondary>
          )}
          <WorkoutDuration exercises={exercises} />
        </FlexCenterColumn>
        {!!ownerName && <PublicButtons isOpenedScreen publication={route.params.workout as PublicType} />}
      </FlexSpaceBetween>
      <FlexCenterColumn style={{ padding: 0 }}>
        {exercises.map(ex => {
          const color = COLORS_EXERCISE[ex?.colorIdx || 0][+isDarkTheme]
          return (
            <TouchableOpacity key={ex.uid}>
              <Card>
                <Exercise isPublic exercise={ex} color={color} />
              </Card>
            </TouchableOpacity>
          )
        })}
      </FlexCenterColumn>
    </Page>
  )
}
