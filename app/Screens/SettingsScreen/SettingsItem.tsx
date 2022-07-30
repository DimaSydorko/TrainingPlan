import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Slider from '@react-native-community/slider'
import { useSettings } from '../../Hooks/redux'
import { Divider, FlexSpaceBetween, TextOrdinary, TextSecondary } from '../../Theme/Parents'
import { screen } from '../../Utils/constants'
import { MySwitch } from '../../Common'

interface IProps {
  label: string
  valueSwitch?: boolean
  onToggleSwitch?: () => void
  valueSlider?: number
  sliderStep?: number
  sliderMaxValue?: number
  sliderMinValue?: number
  sliderValueType?: string
  onSliderChange?: (v: number) => void
}

export default memo(function SettingsItem({
  label,
  valueSwitch,
  onToggleSwitch,
  valueSlider = 0,
  sliderStep = 0.25,
  sliderMaxValue = 1,
  sliderMinValue = 0,
  sliderValueType = '',
  onSliderChange,
}: IProps) {
  const { colors } = useSettings()
  const [valSlider, setValSlider] = useState<number>(valueSlider)

  useEffect(() => {
    setValSlider(p => (p !== valueSlider ? valueSlider : p))
  }, [valueSlider])

  return (
    <View style={styles.container}>
      <FlexSpaceBetween style={styles.content}>
        <TextOrdinary style={{ width: screen.vw - 100 }}>{label}</TextOrdinary>
        {!!onToggleSwitch && <MySwitch value={valueSwitch} onValueChange={onToggleSwitch} />}
        {!!onSliderChange && (
          <TextSecondary>
            {valSlider}
            {sliderValueType}
          </TextSecondary>
        )}
      </FlexSpaceBetween>
      {!!onSliderChange && (
        <Slider
          value={valSlider}
          minimumValue={sliderMinValue}
          step={sliderStep}
          maximumValue={sliderMaxValue}
          onValueChange={v => setValSlider(Math.round(v * 100) / 100)}
          style={styles.slider}
          thumbTintColor={colors.secondPrimary}
          maximumTrackTintColor={colors.disabled}
          minimumTrackTintColor={colors.secondPrimary}
          onResponderEnd={() => onSliderChange(valSlider)}
        />
      )}
      <Divider width={1} color={`${colors.black}40`} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: screen.vw,
  },
  content: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  slider: {
    marginBottom: 10,
    marginHorizontal: 2,
  },
})
