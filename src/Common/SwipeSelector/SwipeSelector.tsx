import React, {useEffect, useState} from "react";
import {Text, View, ViewStyle} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler';
import {FlexAlignCenter, FlexCenter} from "../Parents/Parents";
import {colors} from "../../Theme/colors";
import {theme} from "../../Theme/theme";
import styles from "./styles";

interface SwipeSelectorType {
  onChange: (number: number) => void;
  step?: number;
  maxValue?: number;
  style?: ViewStyle;
}

export default function SwipeSelector({onChange, step = 1, maxValue = 60, style}: SwipeSelectorType) {
  let list: number[] = []
  const [scroll, setScroll] = useState(0)

  useEffect(() => {
    onChange(toFixed(scroll))
  },[scroll])

  for (let i = 0; i < maxValue; i += step) {
    list.push(i)
  }

  const toFixed = (number: number) => {
    return Number((number / 41).toFixed(0))
  }

  const visibleSeater = (value: number) => {
    const diff = Math.abs(toFixed(scroll) - value);

    let opacity = '42';
    switch (diff) {
      case 0: {
        opacity = 'FF';
        break;
      }
      case 1: {
        opacity = 'C0';
        break;
      }
      case 2: {
        opacity = '81';
        break;
      }
      case 3: {
        opacity = '42';
        break;
      }
      default: break;
    }
    return opacity
  }

  function str_pad_left(string: number, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={200}
        decelerationRate="fast"
        onScroll={event => setScroll(event.nativeEvent.contentOffset.x)}
        style={[styles.container, style]}
      >
        <FlexAlignCenter style={styles.itemsContainer}>
          {list.map(value => (
            <Text key={value}
              style={[styles.item, theme.text.ordinary, {color: `${colors.text}${visibleSeater(value)}`}]}
            >
              {str_pad_left(value, '0', 2)}
            </Text>
          ))}
        </FlexAlignCenter>
      </ScrollView>
      <FlexCenter>
        <View style={styles.selectPoint}/>
      </FlexCenter>
    </View>
  )
}