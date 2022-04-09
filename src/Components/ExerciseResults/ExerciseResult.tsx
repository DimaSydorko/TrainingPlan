import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { TextOrdinary } from '../../Theme/Parents'

interface ExerciseResultsType {
  weight: number;
  repeats: number;
  isPrevious?: boolean;
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
  } as ViewStyle,
  textCurrPrev: {
    width: '30%',
  },
})

export default function ExerciseResult({ weight, repeats, isPrevious = true }: ExerciseResultsType) {
  return (
    <View style={styles.container}>
      <TextOrdinary style={styles.textCurrPrev}>
        {`\u2022  ${isPrevious ? 'previous' : 'current'}`}
      </TextOrdinary>
      {weight && (
        <TextOrdinary style={styles.textRepWeight}>
          {weight} kg
        </TextOrdinary>
      )}
      <TextOrdinary style={styles.textRepWeight}>
        {repeats}
      </TextOrdinary>
    </View>
  )
}