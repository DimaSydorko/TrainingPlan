import {
  buildAudioMode,
  clamp,
  durationToMs,
  legacyPitchToExpo,
  legacyRateToExpo,
  normalizeVolume,
  pickBestVoice,
  VoiceLike,
} from '../media-utils'

// Jest globals. Declared locally so `tsc` passes before A7 adds @types/jest; remove once it lands.

describe('clamp / normalizeVolume', () => {
  it('clamps into range and handles NaN', () => {
    expect(clamp(5, 0, 1)).toBe(1)
    expect(clamp(-1, 0, 1)).toBe(0)
    expect(clamp(NaN, 0, 1)).toBe(0)
  })
  it('defaults volume to 1 and keeps it within 0..1', () => {
    expect(normalizeVolume(undefined)).toBe(1)
    expect(normalizeVolume(0)).toBe(0)
    expect(normalizeVolume(0.4)).toBe(0.4)
    expect(normalizeVolume(3)).toBe(1)
  })
})

describe('legacyRateToExpo', () => {
  it('maps the old default 0.5 to normal speed 1.0', () => {
    expect(legacyRateToExpo(0.5)).toBe(1)
  })
  it('maps the Settings slider range 0.1..0.9 to 0.2..1.8', () => {
    expect(legacyRateToExpo(0.1)).toBeCloseTo(0.2)
    expect(legacyRateToExpo(0.9)).toBeCloseTo(1.8)
  })
  it('falls back to 1 when unset', () => {
    expect(legacyRateToExpo(undefined)).toBe(1)
  })
})

describe('legacyPitchToExpo', () => {
  it('passes pitch through within 0.5..2', () => {
    expect(legacyPitchToExpo(1.5)).toBe(1.5)
    expect(legacyPitchToExpo(0.1)).toBe(0.5)
    expect(legacyPitchToExpo(5)).toBe(2)
    expect(legacyPitchToExpo(undefined)).toBe(1)
  })
})

describe('buildAudioMode', () => {
  it('mixes with other audio when ducking is off', () => {
    expect(buildAudioMode({ duckOthers: false })).toEqual({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    })
  })
  it('ducks other audio when ducking is on', () => {
    expect(buildAudioMode({ duckOthers: true }).interruptionMode).toBe('duckOthers')
    // iOS rejects duckOthers without playsInSilentMode
    expect(buildAudioMode({ duckOthers: true }).playsInSilentMode).toBe(true)
  })
})

describe('durationToMs', () => {
  it('is undefined until loaded or when duration is unknown', () => {
    expect(durationToMs(false, 1.2)).toBeUndefined()
    expect(durationToMs(true, 0)).toBeUndefined()
    expect(durationToMs(true, NaN)).toBeUndefined()
    expect(durationToMs(undefined, 1)).toBeUndefined()
  })
  it('converts seconds to rounded ms', () => {
    expect(durationToMs(true, 1.2345)).toBe(1235)
  })
})

describe('pickBestVoice', () => {
  const v = (identifier: string, language: string, quality = 'Default'): VoiceLike => ({
    identifier,
    language,
    quality,
    name: identifier,
  })

  it('returns undefined for no voices or no English voice', () => {
    expect(pickBestVoice([])).toBeUndefined()
    expect(pickBestVoice(undefined)).toBeUndefined()
    expect(pickBestVoice([v('uk-ua-x-hfd-local', 'uk-UA')])).toBeUndefined()
  })

  it('prefers enhanced English voices', () => {
    const voices = [
      v('com.apple.voice.compact.en-US.Samantha', 'en-US'),
      v('com.apple.voice.enhanced.en-GB.Daniel', 'en-GB', 'Enhanced'),
      v('com.apple.voice.compact.de-DE.Anna', 'de-DE', 'Enhanced'),
    ]
    expect(pickBestVoice(voices)).toBe('com.apple.voice.enhanced.en-GB.Daniel')
  })

  it('skips iOS novelty and Eloquence voices', () => {
    const voices = [
      v('com.apple.speech.synthesis.voice.Bells', 'en-US', 'Enhanced'),
      v('com.apple.eloquence.en-US.Rocko', 'en-US', 'Enhanced'),
      v('com.apple.voice.compact.en-IE.Moira', 'en-IE'),
    ]
    expect(pickBestVoice(voices)).toBe('com.apple.voice.compact.en-IE.Moira')
  })

  it('prefers offline Android voices over network ones', () => {
    const voices = [v('en-us-x-sfg-network', 'en-US', 'Enhanced'), v('en-us-x-sfg-local', 'en-US', 'Enhanced')]
    expect(pickBestVoice(voices)).toBe('en-us-x-sfg-local')
  })

  it('prefers en-US over other English variants at equal quality', () => {
    const voices = [v('en-in-x-ahp-local', 'en-IN'), v('en-us-x-iol-local', 'en-US')]
    expect(pickBestVoice(voices)).toBe('en-us-x-iol-local')
  })
})
