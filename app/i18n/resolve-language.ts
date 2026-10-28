import { getDeviceLanguageCodes } from '@platform/locale'
import { DEFAULT_LANGUAGE, LANGUAGE, LANGUAGE_SETTING, LanguageSetting, SUPPORTED_LANGUAGES } from './i18n.constants'

export function isLanguage(code: string): code is LANGUAGE {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
}

export function resolveLanguage(setting: LanguageSetting): LANGUAGE {
  if (setting !== LANGUAGE_SETTING.SYSTEM) return setting
  return getDeviceLanguageCodes().find(isLanguage) ?? DEFAULT_LANGUAGE
}
