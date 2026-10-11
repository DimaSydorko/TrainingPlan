// Seam owned by A5 (docs/migration/README.md §6).
// Backed by @react-native-vector-icons/material-design-icons (the successor of the
// MaterialCommunityIcons set from react-native-vector-icons 9). The `static` entry point is used:
// the font is embedded at build time (config plugin on iOS, autolinked assets on Android), so icons
// render on the first frame with no runtime font loading and no flash of missing glyphs.
import * as React from 'react'
import type { JSX } from 'react'
import { StyleProp, TextStyle } from 'react-native'
import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons/static'

/** Every valid icon name. `app/Theme/icons.ts` is checked against it. */
export type IconName = MaterialDesignIconsIconName

export function Icon(props: { name: string; size?: number; color?: string; style?: StyleProp<TextStyle> }): JSX.Element {
  const { name, size, color, style } = props
  return <MaterialDesignIcons name={name as IconName} size={size} color={color} style={style} />
}
