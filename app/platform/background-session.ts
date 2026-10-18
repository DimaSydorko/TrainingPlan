// Device seam implemented with expo-notifications. Keep the exported signatures stable.
//
// Replaces react-native-background-actions. Nothing here keeps JS running in the background: the
// workout clock is timestamp based (app/screens/playing-screen/playback-schedule.ts) and re-syncs when
// the app comes back. This module only talks to the notification system:
//
// - Session (startSession/updateSession/stopSession): an ongoing ("sticky") notification with the
//   workout, the current exercise and the time the current segment ends. Android only: it is
//   re-posted under the same identifier, so Android updates it in place on a silent low-importance
//   channel. iOS has no ongoing notifications (that would need a Live Activity, i.e. native code),
//   so the session calls do nothing there.
// - Cues (scheduleCues/cancelCues): local notifications scheduled at the upcoming segment boundaries
//   ("Next: Squats"), so the user hears/feels them while the phone is locked. While the app is in the
//   foreground the handler below suppresses them, because the player plays its own sound/TTS cues.
// - requestNotificationPermission: Android 13+ POST_NOTIFICATIONS / iOS alert permission, asked with a
//   short explanation first.
import { Alert, AppState, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { SoundType } from '../utils/constants'

export type SessionInfo = {
  title: string
  description: string
  color?: string
  /** Kept for compatibility. Not rendered: a notification cannot be re-posted every second from a
   * suspended JS thread, so `endsAt` is shown instead. */
  progress?: { value: number; max: number }
  /** Epoch ms when the current segment ends; null/undefined while paused */
  endsAt?: number | null
}

export type CueNotification = { id: string; at: number; title: string; body: string }
export type CueOptions = { sound?: SoundType; vibrate?: boolean; color?: string }

const KIND_SESSION = 'workout-session'
const KIND_CUE = 'workout-cue'
const SESSION_ID = 'workout-session'
const SESSION_CHANNEL = 'workout-session'
const isAndroid = Platform.OS === 'android'
const isNative = Platform.OS === 'android' || Platform.OS === 'ios'

// Every call goes through one queue, so cancel/schedule pairs never interleave.
let queue: Promise<unknown> = Promise.resolve()
function enqueue<T>(job: () => Promise<T>): Promise<T | undefined> {
  const run = queue.then(job).catch(e => {
    console.warn('[backgroundSession]', e?.message ?? e)
    return undefined
  })
  queue = run
  return run
}

let setupDone = false
async function ensureSetup() {
  if (setupDone || !isNative) return
  setupDone = true
  Notifications.setNotificationHandler({
    handleNotification: async notification => {
      const kind = notification.request.content.data?.kind
      const foreground = AppState.currentState === 'active'
      if (kind === KIND_SESSION) {
        // Keep it in the tray, never as a heads-up banner or with sound
        return { shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }
      }
      if (kind === KIND_CUE && foreground) {
        // The player plays its own sound, vibration and TTS cues in the foreground
        return { shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }
      }
      return { shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }
    },
  })
  if (isAndroid) {
    await Notifications.setNotificationChannelAsync(SESSION_CHANNEL, {
      name: 'Workout in progress',
      description: 'Shows the current exercise while a workout is playing',
      importance: Notifications.AndroidImportance.LOW,
      sound: null,
      enableVibrate: false,
      showBadge: false,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    })
  }
}

// ---------------------------------------------------------------------------------------------
// Permission

let askedThisRun = false

function explain(): Promise<boolean> {
  return new Promise(resolve => {
    Alert.alert(
      'Workout notifications',
      'Allow notifications so Training Plan can tell you when a rest or exercise ends while your phone is locked.',
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continue', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    )
  })
}

/** Asks once per app run, after a short explanation. Resolves true when notifications may be shown. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) return false
  try {
    // On Android 13+ the system prompt only appears once a channel exists
    await ensureSetup()
    const current = await Notifications.getPermissionsAsync()
    if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return true
    if (!current.canAskAgain || askedThisRun) return false
    askedThisRun = true
    if (!(await explain())) return false
    const result = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    })
    return result.granted
  } catch (e) {
    console.warn('[backgroundSession] permission', e?.message ?? e)
    return false
  }
}

// ---------------------------------------------------------------------------------------------
// Ongoing session notification (Android)

let session: SessionInfo | null = null
let postedKey = ''

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function formatClockTime(ms: number): string {
  const d = new Date(ms)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function renderSession(info: SessionInfo) {
  const body = info.endsAt ? `${info.description} · until ${formatClockTime(info.endsAt)}` : info.description
  return { title: info.title, body, color: info.color }
}

async function postSession() {
  if (!session) return
  const content = renderSession(session)
  const key = JSON.stringify(content)
  if (key === postedKey) return
  postedKey = key
  await Notifications.scheduleNotificationAsync({
    identifier: SESSION_ID,
    content: {
      ...content,
      sound: false,
      sticky: true,
      autoDismiss: false,
      priority: Notifications.AndroidNotificationPriority.LOW,
      data: { kind: KIND_SESSION },
    },
    trigger: { channelId: SESSION_CHANNEL },
  })
}

export async function startSession(info: SessionInfo): Promise<void> {
  if (!isAndroid) return
  await enqueue(async () => {
    await ensureSetup()
    session = { ...info }
    postedKey = ''
    await postSession()
  })
}

export async function updateSession(info: Partial<SessionInfo>): Promise<void> {
  if (!isAndroid) return
  await enqueue(async () => {
    if (!session) return
    session = { ...session, ...info }
    await postSession()
  })
}

export async function stopSession(): Promise<void> {
  if (!isAndroid) return
  await enqueue(async () => {
    session = null
    postedKey = ''
    await Notifications.dismissNotificationAsync(SESSION_ID)
  })
}

// ---------------------------------------------------------------------------------------------
// Cue notifications

let scheduledIds: string[] = []
let scheduledKey = ''

// Android channel sound and vibration are fixed once created, so there is one channel per
// (sound, vibration) pair, created on first use. Sound files are copied into res/raw by the
// expo-notifications config plugin (`sounds` in app.config.ts).
export function cueChannelId(sound: SoundType | undefined, vibrate: boolean): string {
  const base = (sound || SoundType.Bell).replace(/\.[^.]+$/, '')
  return `workout-cues-${base}-${vibrate ? 'vibrate' : 'silent'}`
}

/** Notification sound file for the platform: the mp3 on Android, its `<name>_cue.caf` copy on iOS. */
export function cueSoundFile(sound: SoundType | undefined, platform: string = Platform.OS): string {
  const file = sound || SoundType.Bell
  return platform === 'ios' ? file.replace(/\.[^.]+$/, '_cue.caf') : file
}

const createdChannels = new Set<string>()
async function ensureCueChannel(sound: SoundType | undefined, vibrate: boolean): Promise<string> {
  const id = cueChannelId(sound, vibrate)
  if (!isAndroid || createdChannels.has(id)) return id
  const file = sound || SoundType.Bell
  await Notifications.setNotificationChannelAsync(id, {
    name: `Workout cues (${file.replace(/\.[^.]+$/, '').replace(/_/g, ' ')}${vibrate ? '' : ', no vibration'})`,
    description: 'Rest and exercise changes while the phone is locked',
    importance: Notifications.AndroidImportance.HIGH,
    sound: file,
    enableVibrate: vibrate,
    vibrationPattern: vibrate ? [0, 100, 200, 100] : null,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  })
  createdChannels.add(id)
  return id
}

async function cancelCuesNow() {
  const ids = new Set(scheduledIds)
  try {
    // Also catches cues left behind by a previous run that was killed
    const pending = await Notifications.getAllScheduledNotificationsAsync()
    pending.filter(n => n.content.data?.kind === KIND_CUE).forEach(n => ids.add(n.identifier))
  } catch {}
  await Promise.all([...ids].map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})))
  try {
    const presented = await Notifications.getPresentedNotificationsAsync()
    await Promise.all(
      presented
        .filter(n => n.request.content.data?.kind === KIND_CUE)
        .map(n => Notifications.dismissNotificationAsync(n.request.identifier).catch(() => {}))
    )
  } catch {}
  scheduledIds = []
  scheduledKey = ''
}

/**
 * Replaces every scheduled cue with `cues`. Cues in the past (or within the next half second) are
 * skipped. Calling it again with the same cues is a no-op, so callers can call it on every change.
 */
export async function scheduleCues(cues: CueNotification[], opts: CueOptions = {}): Promise<void> {
  if (!isNative) return
  const vibrate = opts.vibrate ?? true
  const key = JSON.stringify([cues, opts.sound, vibrate, opts.color])
  await enqueue(async () => {
    if (key === scheduledKey) return
    await ensureSetup()
    await cancelCuesNow()
    const channelId = await ensureCueChannel(opts.sound, vibrate)
    const now = Date.now()
    const ids: string[] = []
    for (const cue of cues) {
      if (cue.at <= now + 500) continue
      ids.push(
        await Notifications.scheduleNotificationAsync({
          identifier: cue.id,
          content: {
            title: cue.title,
            body: cue.body,
            // Android plays the channel's sound; iOS needs the .caf copy of the selected sound
            sound: cueSoundFile(opts.sound),
            color: opts.color,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            interruptionLevel: 'active',
            data: { kind: KIND_CUE },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: cue.at, channelId },
        })
      )
    }
    scheduledIds = ids
    scheduledKey = key
  })
}

/** Cancels every scheduled cue and removes delivered cues from the tray. */
export async function cancelCues(): Promise<void> {
  if (!isNative) return
  await enqueue(cancelCuesNow)
}
