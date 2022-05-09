import * as React from 'react'
import { useState } from 'react'
import { ColorPicker } from 'react-native-color-picker'
import { TouchableOpacity, View } from 'react-native'
import { AppModal } from '../index'
import { screen } from '../../Utils/constants'
import { TextHeader } from '../../Theme/Parents'

interface IAppColorPicker {
  value: string
  onChange: (value: string) => void
}

export default function AppColorPicker({ value, onChange }: IAppColorPicker) {
  const [isModal, setIsModal] = useState(false)
  const [position, setPosition] = useState<string>(value)
  const [color, setColor] = useState<string>('')

  return (
    <>
      <TouchableOpacity
        style={{ borderRadius: 100, backgroundColor: value, height: 30, width: 30 }}
        onPress={() => setIsModal(true)}
      />
      <AppModal
        onConfirm={() => onChange(color)}
        onClose={() => {
          setColor(value)
          setIsModal(false)
        }}
        disabled={!color}
        isOpen={isModal}
        header={'ChoseColor'}
      >
        <View style={{ flex: 1, height: screen.vh - 400 }}>
          <View
            style={{ display: 'flex', justifyContent: 'center', backgroundColor: color, height: 35, width: '100%' }}
          >
            {!!color && <TextHeader style={{ marginLeft: 10 }}>Selected</TextHeader>}
          </View>
          {/*@ts-ignore*/}
          <ColorPicker
            hideSliders
            oldColor={value}
            color={position}
            onColorChange={setPosition}
            onColorSelected={setColor}
            onOldColorSelected={setColor}
            style={{ flex: 1 }}
          />
        </View>
      </AppModal>
    </>
  )
}
