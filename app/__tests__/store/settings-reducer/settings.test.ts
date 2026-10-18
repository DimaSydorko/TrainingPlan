import reducer, {
  clearSettings,
  onBatteryModeChange,
  onSoundTypeChange,
  onSoundVolumeChange,
  onThemeChange,
  onTtsDuckingToggle,
  onTtsRateChange,
  onVibrationToggle,
} from '@store/settings-reducer/settings-slice'
import { colorsDark } from '@theme/colors'
import { SoundType } from '@utils/constants'

const initial = () => reducer(undefined, { type: '@@init' })

describe('SettingsSlice', () => {
  it('changes theme, vibration, TTS and sound settings', () => {
    let s = reducer(initial(), onThemeChange(colorsDark))
    s = reducer(s, onVibrationToggle())
    s = reducer(s, onTtsDuckingToggle())
    s = reducer(s, onTtsRateChange(0.8))
    s = reducer(s, onSoundTypeChange(SoundType.Bell))
    s = reducer(s, onSoundVolumeChange(0.3))
    expect(s.colors).toEqual(colorsDark)
    expect(s.isVibration).toBe(false)
    expect(s.tts).toMatchObject({ isDucking: true, rate: 0.8 })
    expect(s.sound).toEqual({ type: SoundType.Bell, volume: 0.3 })
  })

  it('battery mode forces the dark theme', () => {
    const s = reducer(initial(), onBatteryModeChange())
    expect(s.isSaveBatteryMode).toBe(true)
    expect(s.colors).toEqual(colorsDark)
  })

  it('clearSettings restores the defaults', () => {
    const changed = reducer(reducer(initial(), onVibrationToggle()), onSoundVolumeChange(0))
    expect(reducer(changed, clearSettings())).toEqual(initial())
  })
})
