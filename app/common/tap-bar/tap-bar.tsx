import * as React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import AppText from '../app-text/app-text'
import styles from './tap-bar.styles'

type TapBarProps = {
  values: string[]
  currentValue: string
  onChange: (value: string) => void
}

export default function TapBar({ values, currentValue, onChange }: TapBarProps) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.container}>
      {values.map((value, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => onChange(value)}
          style={[
            styles.tab,
            { backgroundColor: value === currentValue ? `${colors.accent}40` : `${colors.inverse}10` },
          ]}
        >
          <AppText variant='title' color={value === currentValue ? colors.accent : colors.textSecondary} align='center'>
            {value}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  )
}
