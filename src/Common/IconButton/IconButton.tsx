import React from "react";
import {TouchableOpacity, ViewStyle} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {colors} from "../../Theme/colors";

interface IconButtonType {
  iconName: string
  onPress: () => void
  color?: string
  size?: number
  disabled?: boolean
  style?: ViewStyle | ViewStyle[]
}

export default function IconButton({
   iconName,
   onPress,
   size = 24,
   disabled = false,
   color = colors.textSecondary,
   style,
 }: IconButtonType) {

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[{
      opacity: disabled ? 0.5 : 1,
      borderRadius: 50,
    }, style]}>
      <Icon name={iconName} color={color} size={size}/>
    </TouchableOpacity>
  )
}