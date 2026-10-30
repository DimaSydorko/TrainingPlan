import * as React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '@common/app-text/app-text'
import Card from '@common/card/card'
import styles from './placeholder-card.styles'

export default memo(function AiSuggestionPage() {
  const { t } = useTranslation('home')

  return (
    <Card style={styles.card} testID='home.ai-suggestion'>
      <AppText variant='bodyStrong'>{t('home:ai.title')}</AppText>
      <AppText variant='caption' tone='secondary'>
        {t('home:comingSoon')}
      </AppText>
    </Card>
  )
})
