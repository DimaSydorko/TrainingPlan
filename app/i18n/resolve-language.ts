import { getDeviceLanguageCodes } from '@platform/locale'
import { DEFAULT_LANGUAGE, Language, LANGUAGE_SETTING, LanguageSetting, SUPPORTED_LANGUAGES } from './i18n.constants'

export function isLanguage(code: string): code is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
}

export function resolveLanguage(setting: LanguageSetting): Language {
  if (setting !== LANGUAGE_SETTING.SYSTEM) return setting
  return getDeviceLanguageCodes().find(isLanguage) ?? DEFAULT_LANGUAGE
}
