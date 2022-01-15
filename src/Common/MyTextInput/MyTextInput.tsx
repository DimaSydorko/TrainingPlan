import React from "react";
import {TextInput, TextStyle} from 'react-native'
import {colors} from "../../Theme/colors";
import styles from "./styles";

interface MyTextInputType {
  placeholder?: string;
  onChangeText: (text: string) => void;
  value: string;
  style?: TextStyle;
  secureTextEntry?: boolean;
}

export default function MyTextInput ({placeholder, style, onChangeText, value, secureTextEntry = false}: MyTextInputType) {

  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={colors.text}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      onChangeText={(text) => onChangeText(text)}
      value={value}
      underlineColorAndroid="transparent"
      autoCapitalize="none"
    />
  )
}