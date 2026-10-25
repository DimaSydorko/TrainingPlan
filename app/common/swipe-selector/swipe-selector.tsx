import * as React from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native'
import { useAppTheme } from '@theme/use-app-theme'
import AppText from '../app-text/app-text'
import { buildPickerValues, indexForOffset, indexForValue } from './picker-math'
import { ITEM_HEIGHT } from './swipe-selector.constants'
import styles from './swipe-selector.styles'

// Replaces react-native-scroll-picker-wheel (unmaintained since 2021, needs undeclared prop-types,
// and ignored the colour props passed here). Same props as before; a snapping FlatList wheel.

type SwipeSelectorType = {
  onChange: (number: number) => void
  value?: number
  step?: number
  maxValue?: number
  testID?: string
}

export default memo(function SwipeSelector({
  onChange,
  value = 0,
  step = 1,
  maxValue = 60,
  testID,
}: SwipeSelectorType) {
  const { colors } = useAppTheme()
  const values = useMemo(() => buildPickerValues(maxValue, step), [maxValue, step])
  const valueIndex = indexForValue(value, step, values.length)
  const listRef = useRef<FlatList<number>>(null)
  const [activeIndex, setActiveIndex] = useState(valueIndex)
  const committedIndex = useRef(valueIndex)

  // Follow value changes made outside the picker (e.g. the modal resetting the exercise)
  useEffect(() => {
    if (valueIndex !== committedIndex.current) {
      committedIndex.current = valueIndex
      setActiveIndex(valueIndex)
      listRef.current?.scrollToOffset({ offset: valueIndex * ITEM_HEIGHT, animated: false })
    }
  }, [valueIndex])

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndex(indexForOffset(e.nativeEvent.contentOffset.y, ITEM_HEIGHT, values.length))
    },
    [values.length]
  )

  const commit = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = indexForOffset(e.nativeEvent.contentOffset.y, ITEM_HEIGHT, values.length)
      setActiveIndex(idx)
      if (idx !== committedIndex.current) {
        committedIndex.current = idx
        onChange(values[idx])
      }
    },
    [values, onChange]
  )

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<number>) => (
      <View style={styles.item}>
        <AppText
          align='center'
          color={index === activeIndex ? colors.accent : colors.textSecondary}
          style={styles.itemText}
        >
          {item}
        </AppText>
      </View>
    ),
    [activeIndex, colors.accent, colors.textSecondary]
  )

  return (
    <View testID={testID} style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <View pointerEvents='none' style={[styles.selection, { borderColor: colors.surface }]} />
      <FlatList
        ref={listRef}
        data={values}
        extraData={activeIndex}
        keyExtractor={item => String(item)}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        initialScrollIndex={valueIndex}
        contentContainerStyle={styles.listContent}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate='fast'
        bounces={false}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={commit}
        onScrollEndDrag={commit}
      />
    </View>
  )
})
