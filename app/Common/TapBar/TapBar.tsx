import * as React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSettings } from '../../Hooks/redux'
import { TextHeader } from '../../Theme/Parents'

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    margin: 5,
  },
})

interface ITapBar {
  values: string[]
  currentValue: string
  onChange: (value: string) => void
}

export default function TapBar({ values, currentValue, onChange }: ITapBar) {
  const { colors } = useSettings()

  return (
    <View style={styles.container}>
      {values.map((value, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => onChange(value)}
          style={{
            marginHorizontal: 5,
            borderRadius: 8,
            padding: 5,
            backgroundColor: value === currentValue ? `${colors.secondPrimary}40` : `${colors.black}10`,
          }}
        >
          <TextHeader color={value === currentValue ? colors.secondPrimary : colors.textSecondary} center>
            {value}
          </TextHeader>
        </TouchableOpacity>
      ))}
    </View>
  )
}
