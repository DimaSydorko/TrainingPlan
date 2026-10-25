export const LANGUAGE = { EN: 'en', UK: 'uk', DE: 'de' } as const
export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE]

export const LANGUAGE_SETTING = { SYSTEM: 'system', ...LANGUAGE } as const
export type LanguageSetting = (typeof LANGUAGE_SETTING)[keyof typeof LANGUAGE_SETTING]

export const DEFAULT_LANGUAGE: Language = LANGUAGE.EN
export const SUPPORTED_LANGUAGES: readonly Language[] = Object.values(LANGUAGE)

export const DEFAULT_NAMESPACE = 'common'

export const SPEECH_LOCALE: Record<Language, string> = { en: 'en-US', uk: 'uk-UA', de: 'de-DE' }
