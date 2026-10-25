import { getLocales } from 'expo-localization'

export function getDeviceLanguageCodes(): string[] {
  return getLocales()
    .map(locale => locale.languageCode)
    .filter((code): code is string => Boolean(code))
}
