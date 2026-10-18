// Background side of the player. Replaces components/BackgroundAction.tsx
// (react-native-background-actions):
// - asks for notification permission (with an explanation) when the player opens;
// - keeps the ongoing "workout in progress" notification up to date (Android, not in battery-save
//   mode, as before);
// - schedules cue notifications for the upcoming segment boundaries and reschedules them on every
//   clock change (start, pause, resume, skip, previous, reload, resync), so they fire while the phone
//   is locked. Leaving the player clears all of them.
import { useEffect, useMemo } from 'react'
import {
  cancelCues,
  requestNotificationPermission,
  scheduleCues,
  startSession,
  stopSession,
  updateSession,
} from '../../platform/background-session'
import { SoundType } from '../../utils/constants'
import { buildCues, Clock, Segment, segmentEndsAt, upcomingBoundaries } from './playback-schedule'

// iOS keeps at most 64 pending local notifications per app; stay well below
const MAX_CUES = 20

type Params = {
  getSchedule: () => { segments: Segment[]; clock: Clock }
  clockVersion: number
  isPlaying: boolean
  isComplete: boolean
  showSession: boolean
  workoutName: string
  description: string
  color: string
  sound?: SoundType
  isVibration: boolean
}

export default function useBackgroundCues({
  getSchedule,
  clockVersion,
  isPlaying,
  isComplete,
  showSession,
  workoutName,
  description,
  color,
  sound,
  isVibration,
}: Params) {
  useEffect(() => {
    requestNotificationPermission().then()
    return () => {
      cancelCues().then()
      stopSession().then()
    }
  }, [])

  // Cue notifications
  useEffect(() => {
    if (!isPlaying || isComplete) {
      cancelCues().then()
      return
    }
    const now = Date.now()
    const { segments, clock } = getSchedule()
    const cues = buildCues(segments, upcomingBoundaries(segments, clock, now, MAX_CUES))
    scheduleCues(cues, { sound, vibrate: isVibration, color }).then()
  }, [clockVersion, isPlaying, isComplete, getSchedule, sound, isVibration, color])

  // Ongoing notification
  const endsAt = useMemo(() => {
    if (!isPlaying || isComplete) return null
    const { segments, clock } = getSchedule()
    return segmentEndsAt(segments, clock)
  }, [clockVersion, isPlaying, isComplete, getSchedule])

  const sessionDescription = isComplete ? 'Workout complete' : isPlaying ? description : `${description} · paused`

  useEffect(() => {
    if (!showSession) return
    startSession({ title: workoutName, description: sessionDescription, color, endsAt }).then()
    return () => {
      stopSession().then()
    }
  }, [showSession])

  useEffect(() => {
    if (showSession) updateSession({ title: workoutName, description: sessionDescription, color, endsAt }).then()
  }, [showSession, workoutName, sessionDescription, color, endsAt])
}
