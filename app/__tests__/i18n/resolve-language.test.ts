import { DEFAULT_LANGUAGE, LANGUAGE, LANGUAGE_SETTING } from '@i18n/i18n.constants'
import { isLanguage, resolveLanguage } from '@i18n/resolve-language'

type ResolveLanguageModule = typeof import('@i18n/resolve-language')
type LocaleModule = typeof import('@platform/locale')
type DeviceLocale = { languageCode: string | null }

function loadWithNativeModule<T>(modulePath: string, nativeModule: object | null): T {
  let loadedModule: T
  jest.isolateModules(() => {
    jest.doMock('expo', () => ({ requireOptionalNativeModule: () => nativeModule }))
    loadedModule = require(modulePath)
  })
  return loadedModule
}

function resolveWithDeviceLanguages(...languageCodes: (string | null)[]) {
  const locales: DeviceLocale[] = languageCodes.map(languageCode => ({ languageCode }))
  const module = loadWithNativeModule<ResolveLanguageModule>('@i18n/resolve-language', { getLocales: () => locales })
  return module.resolveLanguage(LANGUAGE_SETTING.SYSTEM)
}

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
    expect(resolveWithDeviceLanguages('uk')).toBe(LANGUAGE.UK)
  })

  it('picks the first supported device language in order of preference', () => {
    expect(resolveWithDeviceLanguages('pl', null, 'de', 'uk')).toBe(LANGUAGE.DE)
  })

  it('falls back to the default language when no device language is supported', () => {
    expect(resolveWithDeviceLanguages('pl', 'fr')).toBe(DEFAULT_LANGUAGE)
  })
})

describe('getDeviceLanguageCodes without the native module', () => {
  it('reads the language from Intl', () => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValueOnce({ locale: 'uk-UA' } as Intl.ResolvedDateTimeFormatOptions)
    const { getDeviceLanguageCodes } = loadWithNativeModule<LocaleModule>('@platform/locale', null)

    expect(getDeviceLanguageCodes()).toEqual(['uk'])
  })
})
