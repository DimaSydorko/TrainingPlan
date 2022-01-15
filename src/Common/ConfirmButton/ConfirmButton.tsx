import styles from "./styles";
import {Text, TextStyle, TouchableOpacity, ViewStyle} from "react-native";
import React, {useEffect, useState} from "react";

interface ConfirmButtonType {
  header: string;
  onPress: () => void;
  headerStyle?: TextStyle;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function ConfirmButton ({ onPress, header, headerStyle, style, disabled = false }:ConfirmButtonType) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.button,
        isPressed ? styles.colorPressed : styles.color, style]}
      onPress={onPress}
      activeOpacity={1}
      disabled={disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Text style={[styles.buttonTitle, headerStyle]}>{header}</Text>
    </TouchableOpacity>
  )
}

