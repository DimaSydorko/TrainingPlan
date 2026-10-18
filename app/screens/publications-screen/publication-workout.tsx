import * as React from 'react'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSettings } from '../../hooks/redux'
import { WorkoutDuration } from '../../common'
import { Card, FlexCenterColumn, FlexSpaceBetween, Page, TextSecondary } from '../../theme/parents'
import { PublicType, PublicationScreensParamList } from '../../utils/types'
import Exercise from '../../components/exercise/exercise'
import { COLORS_EXERCISE, colorsDark } from '../../theme/colors'
import NoDataIcon from '../../assets/icons/no-data-icon'
import { appScreen, ScreenName } from '../../utils/constants'
import PublicButtons from '../../components/publication/public-buttons'

type PropsType = StackScreenProps<PublicationScreensParamList, ScreenName.PublicationWorkout>

export default function PublicationWorkout({ route, navigation }: PropsType) {
  const { colors } = useSettings()
  const { name, exercises, ownerName } = route.params.workout
  const isDarkTheme = colors.primary === colorsDark.primary

  useEffect(() => {
    navigation.setOptions({ title: name })
  }, [])

  return (
    <Page>
      <FlexSpaceBetween style={{ padding: 10, paddingHorizontal: 20, width: appScreen.vw }}>
        <FlexCenterColumn style={{ alignItems: 'flex-start' }}>
          {!!ownerName && (
            <TextSecondary style={{ width: appScreen.vw / 2 }} color={colors.secondPrimary}>
              By {ownerName}
            </TextSecondary>
          )}
          <WorkoutDuration exercises={exercises} />
        </FlexCenterColumn>
        {!!ownerName && <PublicButtons isOpenedScreen publication={route.params.workout as PublicType} />}
      </FlexSpaceBetween>
      <FlexCenterColumn style={{ padding: 0 }}>
        {exercises.length ? (
          exercises.map(ex => {
            const color = COLORS_EXERCISE[ex?.colorIdx || 0][+isDarkTheme]
            return (
              <TouchableOpacity key={ex.uid}>
                <Card>
                  <Exercise isPublic exercise={ex} color={color} />
                </Card>
              </TouchableOpacity>
            )
          })
        ) : (
          <NoDataIcon />
        )}
      </FlexCenterColumn>
    </Page>
  )
}
