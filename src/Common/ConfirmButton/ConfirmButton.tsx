import styles from "./styles";
import {Text, TextStyle, TouchableOpacity, ViewStyle} from "react-native";
import React from "react";

interface ConfirmButtonType {
  header: string;
  onPress: () => void;
  headerStyle?: TextStyle;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function ConfirmButton ({ onPress, header, headerStyle, style, disabled = false }:ConfirmButtonType) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonTitle, headerStyle]}>{header}</Text>
    </TouchableOpacity>
  )
}

