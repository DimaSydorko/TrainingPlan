import { StyleSheet } from 'react-native'
import { spacing } from '@theme/tokens'

const preset = StyleSheet.create({
  centerColumn: { flex: 1, alignItems: 'center' },
  center: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  start: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: spacing.xs },
  spaceBetween: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  end: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  secondHeader: { marginVertical: 10, paddingHorizontal: 5 },
})

const direction = StyleSheet.create({
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
})

const align = StyleSheet.create({
  start: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  end: { alignItems: 'flex-end' },
  stretch: { alignItems: 'stretch' },
  baseline: { alignItems: 'baseline' },
})

const justify = StyleSheet.create({
  start: { justifyContent: 'flex-start' },
  center: { justifyContent: 'center' },
  end: { justifyContent: 'flex-end' },
  between: { justifyContent: 'space-between' },
  around: { justifyContent: 'space-around' },
  evenly: { justifyContent: 'space-evenly' },
})

const gap = StyleSheet.create({
  none: { gap: spacing.none },
  xxs: { gap: spacing.xxs },
  xs: { gap: spacing.xs },
  sm: { gap: spacing.sm },
  md: { gap: spacing.md },
  lg: { gap: spacing.lg },
  xl: { gap: spacing.xl },
  xxl: { gap: spacing.xxl },
  xxxl: { gap: spacing.xxxl },
})

const modifier = StyleSheet.create({
  fullWidth: { width: '100%' },
  fill: { flex: 1 },
})

export default { preset, direction, align, justify, gap, modifier }
