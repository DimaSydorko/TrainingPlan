import { requireOptionalNativeModule } from 'expo'
import { LOCALIZATION_MODULE_NAME } from './locale.constants'

type NativeLocale = { languageCode: string | null }
type LocalizationModule = { getLocales: () => NativeLocale[] }

const localization = requireOptionalNativeModule<LocalizationModule>(LOCALIZATION_MODULE_NAME)

function getIntlLanguageCode() {
  return Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0]
}

export function getDeviceLanguageCodes(): string[] {
  if (!localization) return [getIntlLanguageCode()]

  return localization
    .getLocales()
    .map(locale => locale.languageCode)
    .filter((code): code is string => Boolean(code))
}
