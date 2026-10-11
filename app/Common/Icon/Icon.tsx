// Seam owned by A5 (docs/migration/README.md §6). Phase 0 temporary wrapper.
// TODO(A5): switch to @react-native-vector-icons/material-design-icons (@expo/vector-icons is deprecated).
// Icon names are MaterialCommunityIcons names (see app/Theme/icons.ts).
import * as React from 'react'
import type { JSX } from 'react'
import { StyleProp, TextStyle } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

export function Icon(props: { name: string; size?: number; color?: string; style?: StyleProp<TextStyle> }): JSX.Element {
  const { name, size, color, style } = props
  return <MaterialCommunityIcons name={name as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={size} color={color} style={style} />
}

