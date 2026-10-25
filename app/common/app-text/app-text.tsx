import { Text, TextProps } from 'react-native'
import { useThemeColors } from '@theme/use-app-theme'
import type { TypographyVariant } from '@theme/tokens'
import { APP_TEXT_MAX_FONT_SIZE_MULTIPLIER, APP_TEXT_TONE_COLOR, AppTextTone } from './app-text.constants'
import styles from './app-text.styles'

export type AppTextAlign = 'left' | 'center' | 'right'

export type AppTextProps = TextProps & {
  variant?: TypographyVariant
  tone?: AppTextTone
  color?: string
  align?: AppTextAlign
}

const AppText = ({
  variant = 'body',
  tone = 'primary',
  color,
  align = 'left',
  maxFontSizeMultiplier = APP_TEXT_MAX_FONT_SIZE_MULTIPLIER,
  style,
  children,
  ...props
}: AppTextProps) => {
  const colors = useThemeColors()
  const textColor = color || colors[APP_TEXT_TONE_COLOR[tone]]

  return (
    <Text
      style={[styles[variant], styles[align], { color: textColor }, style]}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    >
      {children}
    </Text>
  )
}

export default AppText
