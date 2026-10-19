import * as React from 'react'
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import AppText from '@common/app-text/app-text'
import { useAppTheme } from '@theme/use-app-theme'

interface ExerciseResultsType {
  weight: number
  repeats: number
  isPrevious?: boolean
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  } as ViewStyle,
  textRepWeight: {
    width: '35%',
    textAlign: 'center',
  } as TextStyle,
  textCurrPrev: {
    width: '30%',
  },
})

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
