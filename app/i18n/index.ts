import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANGUAGE, DEFAULT_NAMESPACE, LANGUAGE_SETTING } from './i18n.constants'
import { de } from './locales/de'
import { en } from './locales/en'
import { uk } from './locales/uk'
import { resolveLanguage } from './resolve-language'

export const resources = { en, uk, de } as const

i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(LANGUAGE_SETTING.SYSTEM),
  fallbackLng: DEFAULT_LANGUAGE,
  ns: Object.keys(en),
  defaultNS: DEFAULT_NAMESPACE,
  interpolation: { escapeValue: false },
})

export default i18n
