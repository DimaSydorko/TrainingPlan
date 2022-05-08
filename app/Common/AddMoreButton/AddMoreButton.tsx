import * as React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { FlexCenter, TextHeader } from '../../Theme/Parents'
import { useSettings } from '../../Hooks/redux'
import styles from './styles'

interface AddMoreButtonType {
  onPress: () => void
  color?: string
  header?: string
}

export default function AddMoreButton({ onPress, color, header = '' }: AddMoreButtonType) {
  const { colors } = useSettings()
  const newColor = color || colors.textSecondary
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <FlexCenter>
        <View style={[styles.icon, { borderColor: newColor }]}>
          <Icon name={'plus'} size={24} color={newColor} />
        </View>
        <TextHeader color={newColor} style={styles.header}>
          Add {header}
        </TextHeader>
      </FlexCenter>
    </TouchableOpacity>
  )
}
