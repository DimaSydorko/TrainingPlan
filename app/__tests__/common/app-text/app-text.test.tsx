import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import AppText from '@common/app-text/app-text'
import { APP_TEXT_MAX_FONT_SIZE_MULTIPLIER } from '@common/app-text/app-text.constants'
import { darkColors, lightColors } from '@theme/themes'
import { THEME_MODE } from '@theme/themes.constants'
import { typography } from '@theme/tokens'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../../utils/reset-test-stores'

const getTextStyle = () => StyleSheet.flatten(screen.getByTestId('text').props.style)

describe('AppText', () => {
  beforeEach(() => {
    resetTestStores()
    useSettingsStore.setState({ themeMode: THEME_MODE.LIGHT })
  })

  it('renders body text in the primary tone, left aligned, with a capped font scale by default', async () => {
    await render(<AppText testID='text'>Hello</AppText>)

    expect(screen.getByText('Hello')).toBeOnTheScreen()
    expect(getTextStyle()).toEqual({ ...typography.body, textAlign: 'left', color: lightColors.textPrimary })
    expect(screen.getByTestId('text').props.maxFontSizeMultiplier).toBe(APP_TEXT_MAX_FONT_SIZE_MULTIPLIER)
    expect(APP_TEXT_MAX_FONT_SIZE_MULTIPLIER).toBe(1.3)
  })

  it.each([
    ['title', { fontSize: 18, fontWeight: '700' }],
    ['body', { fontSize: 18, fontWeight: '500' }],
    ['caption', { fontSize: 14, fontWeight: '600' }],
    ['link', { fontSize: 16, fontWeight: '700' }],
  ] as const)('uses the %s typography', async (variant, expected) => {
    await render(<AppText testID='text' variant={variant} />)

    expect(getTextStyle()).toMatchObject({ fontSize: expected.fontSize, fontWeight: expected.fontWeight })
    expect(getTextStyle()).not.toHaveProperty('lineHeight')
  })

  it('renders bodyStrong as bold body text', async () => {
    await render(<AppText testID='text' variant='bodyStrong' />)

    expect(getTextStyle()).toMatchObject({ fontSize: 18, fontWeight: '700' })
  })

  it.each([
    ['primary', 'textPrimary'],
    ['secondary', 'textSecondary'],
    ['danger', 'danger'],
    ['accent', 'accent'],
    ['inverse', 'inverse'],
    ['onPrimary', 'onPrimary'],
  ] as const)('maps the %s tone to the %s color role in both themes', async (tone, role) => {
    await render(<AppText testID='text' tone={tone} />)
    expect(getTextStyle().color).toBe(lightColors[role])

    useSettingsStore.setState({ themeMode: THEME_MODE.DARK })
    await render(<AppText testID='text' tone={tone} />)
    expect(getTextStyle().color).toBe(darkColors[role])
  })

  it.each(['left', 'center', 'right'] as const)('aligns the text %s', async align => {
    await render(<AppText testID='text' align={align} />)

    expect(getTextStyle().textAlign).toBe(align)
  })

  it('lets an explicit color and style override the tone and variant', async () => {
    await render(<AppText testID='text' tone='danger' color='red' style={{ fontSize: 24 }} />)

    expect(getTextStyle()).toMatchObject({ color: 'red', fontSize: 24 })
  })

  it('passes text props through and allows overriding the font scale cap', async () => {
    await render(
      <AppText testID='text' numberOfLines={2} ellipsizeMode='tail' maxFontSizeMultiplier={2}>
        Long
      </AppText>
    )
    const text = screen.getByTestId('text')

    expect(text.props.numberOfLines).toBe(2)
    expect(text.props.ellipsizeMode).toBe('tail')
    expect(text.props.maxFontSizeMultiplier).toBe(2)
  })
})
