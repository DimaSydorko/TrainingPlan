import React from "react";
import {TouchableOpacity} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {colors} from "../../Theme/colors";

interface IconButtonType {
  name: string;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
}

export default function IconButton({name, onPress, size = 24, disabled = false, color = colors.textSecondary}: IconButtonType) {
  return (
   <TouchableOpacity onPress={onPress} disabled={disabled} style={{opacity: disabled ? 0.5 : 1}}>
     <Icon name={name} color={color} size={size}/>
   </TouchableOpacity>
  )
}