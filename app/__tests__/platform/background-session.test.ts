// Pure helpers of the backgroundSession seam. expo-notifications is mocked in app/__tests__/setup.
import { cueChannelId, cueSoundFile, formatClockTime } from '@platform/background-session'
import { SoundType } from '@utils/constants'

describe('backgroundSession helpers', () => {
  it('builds one Android channel id per (sound, vibration) pair', () => {
    expect(cueChannelId(SoundType.DigitalClock, true)).toBe('workout-cues-digital_clock-vibrate')
    expect(cueChannelId(SoundType.DigitalClock, false)).toBe('workout-cues-digital_clock-silent')
    expect(cueChannelId(undefined, false)).toBe('workout-cues-bell-silent')
  })

  it('uses the mp3 on Android and the .caf copy on iOS', () => {
    expect(cueSoundFile(SoundType.HopBell, 'android')).toBe('hop_bell.mp3')
    expect(cueSoundFile(SoundType.HopBell, 'ios')).toBe('hop_bell_cue.caf')
    expect(cueSoundFile(undefined, 'ios')).toBe('bell_cue.caf')
  })

  it('formats a local clock time as HH:MM:SS', () => {
    const at = new Date(2026, 0, 1, 7, 5, 9).getTime()
    expect(formatClockTime(at)).toBe('07:05:09')
  })
})
