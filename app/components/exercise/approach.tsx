import * as React from 'react'
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { TextOrdinary } from '@theme/parents'
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
  const color = isPrevious ? colors.text : colors.primary
  return (
    <View style={styles.container}>
      <TextOrdinary color={color} style={styles.textCurrPrev}>{`\u2022  ${
        isPrevious ? 'previous' : 'current'
      }`}</TextOrdinary>
      <TextOrdinary color={color} style={styles.textRepWeight}>
        {repeats}
      </TextOrdinary>
      {!!weight && (
        <TextOrdinary color={color} style={styles.textRepWeight}>
          {weight} kg
        </TextOrdinary>
      )}
    </View>
  )
}
