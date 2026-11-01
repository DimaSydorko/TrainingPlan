import * as React from 'react'
import { memo } from 'react'
import { View } from 'react-native'

import Screen from '@common/screen/screen'
import NoDataIcon from '@assets/icons/no-data-icon'
import { useAppInsets } from '@theme/insets'
import { FUTURE_FLAG } from '@utils/constants'
import { useSessionUserId } from '@stores/session/use-session-store'
import useProfile from '@services/profiles/use-profile'
import AiSuggestionPage from './components/ai-suggestion-page'
import AskAiBar from './components/ask-ai-bar'
import GreetingHeader from './components/greeting-header'
import StatsCard from './components/stats-card'
import TodaySessionCard from './components/today-session-card'
import WorkoutsPreview from './components/workouts-preview'
import useHomeNavigation from './hooks/use-home-navigation'
import useHomeWorkouts from './hooks/use-home-workouts'
import styles from './home-screen.styles'

export default memo(function HomeScreen() {
  const { top } = useAppInsets()
  const userId = useSessionUserId()
  const { data: profile } = useProfile(userId)
  const { todayWorkout, upcomingWorkouts } = useHomeWorkouts()
  const { handleStartWorkout, handleOpenWorkout, handleOpenAllWorkouts, handleOpenProfile } = useHomeNavigation()

  return (
    <View style={[styles.container, { paddingTop: top }]} testID='home.screen'>
      <Screen>
        <GreetingHeader
          displayName={profile?.displayName}
          photoUrl={profile?.photoUrl}
          onProfilePress={handleOpenProfile}
        />
        <View style={styles.content}>
          {todayWorkout ? (
            <TodaySessionCard workout={todayWorkout} onStart={handleStartWorkout} onChange={handleOpenAllWorkouts} />
          ) : (
            <NoDataIcon />
          )}
          {FUTURE_FLAG.IS_DEV && <AiSuggestionPage />}
          <WorkoutsPreview
            workouts={upcomingWorkouts}
            onWorkoutPress={handleOpenWorkout}
            onAllPress={handleOpenAllWorkouts}
          />
          {FUTURE_FLAG.IS_DEV && <StatsCard />}
        </View>
      </Screen>
    </View>
  )
})
