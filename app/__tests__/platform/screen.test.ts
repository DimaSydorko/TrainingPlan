import { renderHook } from '@testing-library/react-native'
import { getBreakpoint, getScreen, useScreen } from '@platform/screen'
import { BREAKPOINT } from '@platform/screen.constants'

const mockWindowDimensions = jest.fn()

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockWindowDimensions(),
}))

describe('getBreakpoint', () => {
  it('is compact below 600', () => {
    expect(getBreakpoint(0)).toBe(BREAKPOINT.COMPACT)
    expect(getBreakpoint(390)).toBe(BREAKPOINT.COMPACT)
    expect(getBreakpoint(599.9)).toBe(BREAKPOINT.COMPACT)
  })

  it('is medium from 600 up to 840', () => {
    expect(getBreakpoint(600)).toBe(BREAKPOINT.MEDIUM)
    expect(getBreakpoint(839)).toBe(BREAKPOINT.MEDIUM)
  })

  it('is expanded from 840', () => {
    expect(getBreakpoint(840)).toBe(BREAKPOINT.EXPANDED)
    expect(getBreakpoint(1280)).toBe(BREAKPOINT.EXPANDED)
  })
})

describe('getScreen', () => {
  it('keeps the size and adds the breakpoint', () => {
    expect(getScreen({ width: 700, height: 1000 })).toEqual({
      width: 700,
      height: 1000,
      breakpoint: BREAKPOINT.MEDIUM,
    })
  })
})

describe('useScreen', () => {
  it('follows the window dimensions on rotation', async () => {
    mockWindowDimensions.mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 })
    const { result, rerender } = await renderHook(() => useScreen())

    expect(result.current).toEqual({ width: 390, height: 844, breakpoint: BREAKPOINT.COMPACT })

    mockWindowDimensions.mockReturnValue({ width: 844, height: 390, scale: 3, fontScale: 1 })
    await rerender({})

    expect(result.current).toEqual({ width: 844, height: 390, breakpoint: BREAKPOINT.EXPANDED })
  })

  it('keeps the same object while the size does not change', async () => {
    mockWindowDimensions.mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 })
    const { result, rerender } = await renderHook(() => useScreen())
    const first = result.current

    await rerender({})

    expect(result.current).toBe(first)
  })
})
