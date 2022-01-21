import React from "react";
import {TouchableOpacity} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {colors} from "../../Theme/colors";

interface IconButtonType {
  name: string;
  onPress: () => void;
  color?: string;
}

export default function IconButton({name, onPress, color = colors.textSecondary}: IconButtonType) {
  return (
   <TouchableOpacity onPress={onPress}>
     <Icon name={name} color={color} size={24}/>
   </TouchableOpacity>
  )
}