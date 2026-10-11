// Jest globals are provided at runtime by A7's jest-expo setup. They are declared here (module
// scope, so they never clash with @types/jest) to keep `tsc --noEmit` green before that lands.

import { buildPickerValues, clampIndex, indexForOffset, indexForValue } from '../pickerMath'

describe('SwipeSelector picker math', () => {
  it('builds the same value list as the old picker', () => {
    expect(buildPickerValues(60, 1)).toHaveLength(60)
    expect(buildPickerValues(60, 1)[59]).toBe(59)
    expect(buildPickerValues(60, 5)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
    expect(buildPickerValues(60, 0)).toEqual([])
  })

  it('maps a value to its row index', () => {
    expect(indexForValue(0, 5, 12)).toBe(0)
    expect(indexForValue(25, 5, 12)).toBe(5)
    expect(indexForValue(27, 5, 12)).toBe(5)
    expect(indexForValue(600, 5, 12)).toBe(11)
    expect(indexForValue(undefined as unknown as number, 5, 12)).toBe(0)
  })

  it('maps a scroll offset to the centred row', () => {
    expect(indexForOffset(0, 50, 12)).toBe(0)
    expect(indexForOffset(124, 50, 12)).toBe(2)
    expect(indexForOffset(126, 50, 12)).toBe(3)
    expect(indexForOffset(-40, 50, 12)).toBe(0)
    expect(indexForOffset(10_000, 50, 12)).toBe(11)
  })

  it('clamps indexes', () => {
    expect(clampIndex(5, 0)).toBe(0)
    expect(clampIndex(-1, 3)).toBe(0)
    expect(clampIndex(3, 3)).toBe(2)
  })
})
