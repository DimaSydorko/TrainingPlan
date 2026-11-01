import * as React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '@common/app-text/app-text'
import Card from '@common/card/card'
import styles from './placeholder-card.styles'

export default memo(function StatsCard() {
  const { t } = useTranslation('home')

  return (
    <Card style={styles.card} testID='home.stats'>
      <AppText variant='bodyStrong'>{t('home:stats.title')}</AppText>
      <AppText variant='caption' tone='secondary'>
        {t('home:comingSoon')}
      </AppText>
    </Card>
  )
})
