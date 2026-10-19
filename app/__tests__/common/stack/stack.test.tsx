import { render, screen } from '@testing-library/react-native'
import { StyleSheet, ViewStyle } from 'react-native'
import Stack, { StackPreset } from '@common/stack/stack'
import { spacing } from '@theme/tokens'

const getStackStyle = () => StyleSheet.flatten(screen.getByTestId('stack').props.style)

describe('Stack', () => {
  it('renders children without layout styles by default', async () => {
    await render(<Stack testID='stack' />)

    expect(getStackStyle()).toEqual({})
  })

  it.each([
    ['centerColumn', { flex: 1, alignItems: 'center' }],
    ['center', { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }],
    ['start', { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 4 }],
    ['spaceBetween', { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }],
    ['end', { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }],
    ['secondHeader', { marginVertical: 10, paddingHorizontal: 5 }],
  ] as [StackPreset, ViewStyle][])('applies the %s preset', async (preset, expected) => {
    await render(<Stack testID='stack' preset={preset} />)

    expect(getStackStyle()).toEqual(expected)
  })

  it('builds a layout from direction, align, justify, gap, fullWidth and fill', async () => {
    await render(<Stack testID='stack' direction='row' align='center' justify='between' gap='sm' fullWidth fill />)

    expect(getStackStyle()).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      width: '100%',
      flex: 1,
    })
  })

  it('lets explicit props and style override the preset', async () => {
    await render(<Stack testID='stack' preset='spaceBetween' direction='column' justify='end' style={{ width: 50 }} />)

    expect(getStackStyle()).toEqual({
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: 50,
    })
  })
})
