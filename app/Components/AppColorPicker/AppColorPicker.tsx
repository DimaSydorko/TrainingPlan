import * as React from 'react'
import { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import ColorPicker from 'react-native-wheel-color-picker'
import { AppModal } from '../../Common'
import { screen } from '../../Utils/constants'
import { TextHeader } from '../../Theme/Parents'

interface IAppColorPicker {
  value: string
  onChange: (value: string) => void
}

export default function AppColorPicker({ value, onChange }: IAppColorPicker) {
  const [isModal, setIsModal] = useState(false)
  const [color, setColor] = useState<string>(value)

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
          <ColorPicker onColorChangeComplete={setColor} color={color} discreteLength={5} />
        </View>
      </AppModal>
    </>
  )
}
