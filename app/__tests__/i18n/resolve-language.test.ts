import { getLocales } from 'expo-localization'
import { DEFAULT_LANGUAGE, LANGUAGE, LANGUAGE_SETTING } from '@i18n/i18n.constants'
import { isLanguage, resolveLanguage } from '@i18n/resolve-language'

const mockedGetLocales = getLocales as jest.MockedFunction<typeof getLocales>

const DEVICE_LOCALE = getLocales()[0]

const deviceLocales = (...languageCodes: (string | null)[]) =>
  languageCodes.map(languageCode => ({ ...DEVICE_LOCALE, languageCode })) as ReturnType<typeof getLocales>

describe('isLanguage', () => {
  it.each(Object.values(LANGUAGE))('accepts %s', code => {
    expect(isLanguage(code)).toBe(true)
  })

  it.each(['ukr', 'ru', 'EN', ''])('rejects %p', code => {
    expect(isLanguage(code)).toBe(false)
  })
})

describe('resolveLanguage', () => {
  it('returns an explicit language as is, whatever the device language', () => {
    expect(resolveLanguage(LANGUAGE_SETTING.DE)).toBe(LANGUAGE.DE)
  })

  it('follows the device language when the setting is system', () => {
    mockedGetLocales.mockReturnValueOnce(deviceLocales('uk'))

    expect(resolveLanguage(LANGUAGE_SETTING.SYSTEM)).toBe(LANGUAGE.UK)
  })

  it('picks the first supported device language in order of preference', () => {
    mockedGetLocales.mockReturnValueOnce(deviceLocales('pl', null, 'de', 'uk'))

    expect(resolveLanguage(LANGUAGE_SETTING.SYSTEM)).toBe(LANGUAGE.DE)
  })

  it('falls back to the default language when no device language is supported', () => {
    mockedGetLocales.mockReturnValueOnce(deviceLocales('pl', 'fr'))

    expect(resolveLanguage(LANGUAGE_SETTING.SYSTEM)).toBe(DEFAULT_LANGUAGE)
  })
})
