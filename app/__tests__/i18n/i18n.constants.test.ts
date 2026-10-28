import { LANGUAGE, SPEECH_LOCALE } from '@i18n/i18n.constants'

describe('SPEECH_LOCALE', () => {
  it('has a speech locale for every language and nothing else', () => {
    expect(Object.keys(SPEECH_LOCALE).sort()).toEqual(Object.values(LANGUAGE).sort())
  })

  it.each(Object.entries(SPEECH_LOCALE))('%s uses a locale of its own language (%s)', (language, locale) => {
    expect(locale.split('-')[0]).toBe(language)
  })
})
