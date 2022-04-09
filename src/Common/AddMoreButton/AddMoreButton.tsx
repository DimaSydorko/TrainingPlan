import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { FlexCenter, TextHeader } from '../../Theme/Parents'
import { colors } from '../../Theme/colors'
import styles from './styles'

interface AddMoreButtonType {
  onPress: () => void;
  color?: string;
  header?: string;
}

export default function AddMoreButton({ onPress, color = colors.textSecondary, header = '' }: AddMoreButtonType) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <FlexCenter>
        <View style={styles.icon}>
          <Icon name={'plus'} size={24} color={color} />
        </View>
        <TextHeader color={color} style={styles.header}>
          Add {header}
        </TextHeader>
      </FlexCenter>
    </TouchableOpacity>
  )
}