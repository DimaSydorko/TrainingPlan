import { customAlphabet } from 'nanoid/non-secure'

export const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)

const typeOf = (value: unknown | unknown[]): string =>
  //@ts-ignore
  ({}.toString
    .call(value)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase())

/**
 * Checks for deep object equality
 * @param source an object to compare
 * @param target another object to compare
 * @returns true if both objects are deeply equal
 */
export function deepCompare(source: any, target: any): boolean {
  if (typeOf(source) !== typeOf(target)) {
    return false
  }

  if (typeOf(source) === 'array') {
    if (source.length !== target.length) {
      return false
    }

    return source.every((entry: any, index: number) => deepCompare(entry, target[index]))
  } else if (typeOf(source) === 'object') {
    if (Object.keys(source).length !== Object.keys(target).length) {
      return false
    }

    return Object.keys(source).every(key => deepCompare(source[key], target[key]))
  } else if (typeOf(source) === 'data') {
    return source.getTime() === target.getTime()
  }

  return source === target
}
