import { resources } from '@i18n'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@i18n/i18n.constants'

type TranslationTree = { [key: string]: unknown }
type TranslationEntry = [key: string, value: unknown]

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/
const OTHER_LANGUAGES = SUPPORTED_LANGUAGES.filter(language => language !== DEFAULT_LANGUAGE)
const DEFAULT_NAMESPACES = Object.keys(resources[DEFAULT_LANGUAGE]).sort()

function namespacesOf(language: string): string[] {
  return Object.keys(resources[language] ?? {}).sort()
}

function readNamespace(language: string, namespace: string): TranslationTree {
  return (resources[language]?.[namespace] ?? {}) as TranslationTree
}

function isTree(value: unknown): value is TranslationTree {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function flattenEntries(tree: TranslationTree, prefix = ''): TranslationEntry[] {
  return Object.entries(tree).flatMap(([key, value]): TranslationEntry[] => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    return isTree(value) ? flattenEntries(value, fullKey) : [[fullKey, value]]
  })
}

function baseKeys(tree: TranslationTree): string[] {
  const keys = flattenEntries(tree).map(([key]) => key.replace(PLURAL_SUFFIX, ''))
  return [...new Set(keys)].sort()
}

function invalidValueKeys(tree: TranslationTree): string[] {
  return flattenEntries(tree)
    .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
    .map(([key]) => key)
}

function missingPluralForms(language: string, tree: TranslationTree): string[] {
  const requiredCategories = new Intl.PluralRules(language).resolvedOptions().pluralCategories
  const keys = flattenEntries(tree).map(([key]) => key)
  const pluralBases = new Set(keys.filter(key => PLURAL_SUFFIX.test(key)).map(key => key.replace(PLURAL_SUFFIX, '')))
  return [...pluralBases].flatMap(base =>
    requiredCategories.map(category => `${base}_${category}`).filter(key => !keys.includes(key))
  )
}

describe('resources', () => {
  it('has exactly one entry per supported language', () => {
    expect(Object.keys(resources).sort()).toEqual([...SUPPORTED_LANGUAGES].sort())
  })
})

describe.each(OTHER_LANGUAGES)('%s translations', language => {
  it(`has the same namespaces as ${DEFAULT_LANGUAGE}`, () => {
    expect(namespacesOf(language)).toEqual(DEFAULT_NAMESPACES)
  })

  it.each(DEFAULT_NAMESPACES)(`%s has the same keys as ${DEFAULT_LANGUAGE}`, namespace => {
    expect(baseKeys(readNamespace(language, namespace))).toEqual(baseKeys(readNamespace(DEFAULT_LANGUAGE, namespace)))
  })
})

describe.each([...SUPPORTED_LANGUAGES])('%s values', language => {
  it.each(DEFAULT_NAMESPACES)('%s has only non-empty string values', namespace => {
    expect(invalidValueKeys(readNamespace(language, namespace))).toEqual([])
  })

  it.each(DEFAULT_NAMESPACES)('%s has every plural form the language needs', namespace => {
    expect(missingPluralForms(language, readNamespace(language, namespace))).toEqual([])
  })
})
