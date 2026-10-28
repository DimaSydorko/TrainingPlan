export enum LANGUAGE {
  EN = 'en',
  UK = 'uk',
  DE = 'de',
}

export const LANGUAGE_SETTING = { SYSTEM: 'system', ...LANGUAGE } as const
export type LanguageSetting = (typeof LANGUAGE_SETTING)[keyof typeof LANGUAGE_SETTING]

export const DEFAULT_LANGUAGE: LANGUAGE = LANGUAGE.EN
export const SUPPORTED_LANGUAGES: readonly LANGUAGE[] = Object.values(LANGUAGE)

export enum NAMESPACE {
  COMMON = 'common',
}
export const DEFAULT_NAMESPACE = NAMESPACE.COMMON

export enum SPEECH_LOCALE {
  en = 'en-US',
  uk = 'uk-UA',
  de = 'de-DE',
}
