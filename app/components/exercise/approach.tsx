import * as React from 'react'
import { View } from 'react-native'
import AppText from '@common/app-text/app-text'
import { useAppTheme } from '@theme/use-app-theme'
import styles from './approach.styles'

type ExerciseResultsType = {
  weight: number
  repeats: number
  isPrevious?: boolean
}

export default function Approach({ weight, repeats, isPrevious = true }: ExerciseResultsType) {
  const { colors } = useAppTheme()
  const color = isPrevious ? colors.textPrimary : colors.primary
  return (
    <View style={styles.container}>
      <AppText color={color} style={styles.textCurrPrev}>{`\u2022  ${isPrevious ? 'previous' : 'current'}`}</AppText>
      <AppText color={color} style={styles.textRepWeight}>
        {repeats}
      </AppText>
      {!!weight && (
        <AppText color={color} style={styles.textRepWeight}>
          {weight} kg
        </AppText>
      )}
    </View>
  )
}
