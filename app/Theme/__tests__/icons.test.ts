import { icon } from '../icons'

// Jest globals are provided at runtime by A7's jest-expo setup. They are declared here (module
// scope, so they never clash with @types/jest) to keep `tsc --noEmit` green before that lands.


// The Icon seam renders @react-native-vector-icons/material-design-icons. A name missing from its
// glyph map renders a "?" glyph, so every name in the app's icon map must exist there.
const glyphMap: Record<string, number> = require('@react-native-vector-icons/material-design-icons/glyphmaps/MaterialDesignIcons.json')

describe('icon names', () => {
  it.each(Object.entries(icon))('%s (%s) exists in MaterialDesignIcons', (_key: string, name: string) => {
    expect(glyphMap[name]).toEqual(expect.any(Number))
  })
})
