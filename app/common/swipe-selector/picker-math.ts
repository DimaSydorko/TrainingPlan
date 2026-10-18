// Pure helpers for SwipeSelector (kept free of React Native imports so they are easy to unit test).

/** Values shown by the picker: 0, step, 2*step, ... below maxValue (same list as the old picker). */
export function buildPickerValues(maxValue: number, step: number): number[] {
  const values: number[] = []
  if (step <= 0) return values
  for (let i = 0; i < maxValue; i += step) values.push(i)
  return values
}

export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0
  return Math.min(Math.max(index, 0), count - 1)
}

/** Index of `value` in the list (the old picker used value / step; values off the grid round down). */
export function indexForValue(value: number, step: number, count: number): number {
  if (step <= 0) return 0
  return clampIndex(Math.floor((value || 0) / step), count)
}

/** Index of the row centred in the picker for a vertical scroll offset. */
export function indexForOffset(offsetY: number, itemHeight: number, count: number): number {
  if (itemHeight <= 0) return 0
  return clampIndex(Math.round(offsetY / itemHeight), count)
}
