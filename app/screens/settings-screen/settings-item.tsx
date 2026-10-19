import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Slider from '@react-native-community/slider'
import { useAppTheme } from '@theme/use-app-theme'
import { Divider, FlexSpaceBetween, TextOrdinary, TextSecondary } from '@theme/parents'
import { useScreen } from '@platform/screen'
import { MySwitch } from '@common'
import { SETTINGS_LABEL_GUTTER } from './settings-item.constants'
import { spacing } from '@theme/tokens'

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
  /** Passed to the switch (E2E selectors) */
  testID?: string
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
  testID,
}: IProps) {
  const { colors } = useAppTheme()
  const [valSlider, setValSlider] = useState<number>(valueSlider)
  const { width } = useScreen()

  useEffect(() => {
    setValSlider(p => (p !== valueSlider ? valueSlider : p))
  }, [valueSlider])

  return (
    <View style={{ width }}>
      <FlexSpaceBetween style={styles.content}>
        <TextOrdinary style={{ width: width - SETTINGS_LABEL_GUTTER }}>{label}</TextOrdinary>
        {!!onToggleSwitch && <MySwitch value={valueSwitch} onValueChange={onToggleSwitch} testID={testID} />}
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
          thumbTintColor={colors.accent}
          maximumTrackTintColor={colors.disabled}
          minimumTrackTintColor={colors.accent}
          // The native slider (community/slider 5) does not deliver responder events reliably
          onSlidingComplete={v => onSliderChange(Math.round(v * 100) / 100)}
        />
      )}
      <Divider width={1} color={`${colors.inverse}40`} />
    </View>
  )
})

const styles = StyleSheet.create({
  content: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  slider: {
    marginBottom: 10,
    marginHorizontal: spacing.xxs,
  },
})
