import * as React from 'react'
import { useEffect, useState } from 'react'
import { Text, View, ViewStyle } from 'react-native'
// import { ScrollView } from 'react-native-gesture-handler'
import { FlexAlignCenter, FlexCenterColumn } from '../../Theme/Parents'
import { colors } from '../../Theme/colors'
import { theme } from '../../Theme/theme'
import { screen } from '../../Utils/constants'
import styles from './styles'

interface SwipeSelectorType {
  onChange: (number: number) => void;
  value?: number;
  step?: number;
  maxValue?: number;
  style?: ViewStyle;
}

export default function SwipeSelector({ onChange, value = 0, step = 1, maxValue = 60, style }: SwipeSelectorType) {
  let list: string[] = []
  // const [scroll, setScroll] = useState(value)
  // const [scrollRef, setScrollRef] = useState<any>(null)
  const [dataSourceCords, setDataSourceCords] = useState<any[]>([])
  //
  // useEffect(() => {
  //   scrollRef.scrollTo({
  //     x: dataSourceCords[value - 1],
  //     y: 0,
  //     animated: true,
  //   })
  // }, [])

  // useEffect(() => {
  //   onChange(scroll)
  // }, [scroll])

  for (let i = 0; i < maxValue; i += step) {
    list.push("" + i)
  }

  const toFixed = (number: number) => {
    return Number((number / 41).toFixed(0))
  }

  // const visibleSeater = (value: number) => {
  //   const diff = Math.abs(scroll - value)
  //
  //   let opacity = '40'
  //   switch (diff) {
  //     case 0: {
  //       opacity = 'FF'
  //       break
  //     }
  //     case 1: {
  //       opacity = 'C0'
  //       break
  //     }
  //     case 2: {
  //       opacity = '80'
  //       break
  //     }
  //     default:
  //       break
  //   }
  //   return opacity
  // }

  function str_pad_left(string: number, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length)
  }

  return (
    <View style={{ width: screen.vw - 60 }}>
      {/*<ScrollView style={[styles.container, { paddingTop: !isStartedToScroll ? 150 : 0 }, style]}>*/}
      {/*  <WheelPicker*/}
      {/*    selectedItemTextFontFamily={'picker'}*/}
      {/*    itemTextFontFamily={'picker'}*/}
      {/*    selectedItem={value}*/}
      {/*    data={list}*/}
      {/*    onItemSelected={item => onChange(item)}*/}
      {/*  />*/}
      {/*</ScrollView>*/}
      {/*<ScrollView*/}
      {/*  // ref={(ref) => setScrollRef(ref)}*/}
      {/*  horizontal*/}
      {/*  showsHorizontalScrollIndicator={false}*/}
      {/*  scrollEventThrottle={200}*/}
      {/*  decelerationRate='fast'*/}
      {/*  onScroll={event => {*/}
      {/*    if (scroll !== toFixed(event.nativeEvent.contentOffset.x)) {*/}
      {/*      setScroll(toFixed(event.nativeEvent.contentOffset.x))*/}
      {/*    }*/}
      {/*  }}*/}
      {/*  style={[styles.container, style]}*/}
      {/*>*/}
      {/*  <FlexAlignCenter style={styles.itemsContainer}>*/}
      {/*    {list.map((valueMap, idx) => (*/}
      {/*      <Text*/}
      {/*        key={valueMap}*/}
      {/*        style={[styles.item, theme.text.ordinary, { color: `${colors.text}${visibleSeater(valueMap)}` }]}*/}
      {/*        onLayout={(event) => {*/}
      {/*          const layout = event.nativeEvent.layout*/}
      {/*          dataSourceCords[valueMap] = layout.x*/}
      {/*          setDataSourceCords(dataSourceCords)*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        {str_pad_left(value, '0', 2)}*/}
      {/*      </Text>*/}
      {/*    ))}*/}
      {/*  </FlexAlignCenter>*/}
      {/*</ScrollView>*/}
      <FlexCenterColumn>
        <View style={styles.selectPoint} />
      </FlexCenterColumn>
    </View>
  )
}