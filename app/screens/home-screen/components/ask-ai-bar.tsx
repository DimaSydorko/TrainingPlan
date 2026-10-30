import * as React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '@common/app-text/app-text'
import { Icon } from '@common/icon/icon'
import Stack from '@common/stack/stack'
import { icon } from '@theme/icons'
import { useThemeColors } from '@theme/use-app-theme'
import { HOME_ICON_SIZE } from '../home-screen.constants'
import styles from './ask-ai-bar.styles'

export default memo(function AskAiBar() {
  const { t } = useTranslation('home')
  const colors = useThemeColors()

  return (
    <Stack
      preset='start'
      gap='sm'
      style={[styles.bar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      testID='home.ask-ai'
    >
      <Icon name={icon.aiSparkles} size={HOME_ICON_SIZE.MEDIUM} color={colors.accent} />
      <AppText variant='body' tone='secondary'>
        {t('home:askAi.placeholder')}
      </AppText>
    </Stack>
  )
})
