import * as React from 'react'
import { useState } from 'react'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSettings, useWorkout } from '../../Hooks/redux'
import { screen } from '../../Utils/constants'
import { AppImage, AppModal, TapBar } from '../index'
import { ExerciseImageFilterType } from '../../Utils/types'
import { FlexCenterColumn, TextSecondary } from '../../Theme/Parents'
import { icon } from '../../Theme/icons'
import styles from './styles'

interface IImageSelector {
  value?: string
  onSubmit: (imageUrl: string) => void
}

const tabBarValues: ExerciseImageFilterType[] = ['home', 'street', 'gym']

export default function ImageSelector({ onSubmit, value = '' }: IImageSelector) {
  const { colors } = useSettings()
  const { exerciseImages } = useWorkout()
  const [isModal, setIsModal] = useState(false)
  const [selected, setSelected] = useState<string>(value)
  const [filter, setFilter] = useState<ExerciseImageFilterType>('home')

  return (
    <>
      <TouchableOpacity onPress={() => setIsModal(true)}>
        <View style={[styles.imageButton, styles.imageC]}>
          {value ? (
            <Image source={{ uri: selected }} style={styles.imageButton} />
          ) : (
            <Icon name={icon.empty} size={30} />
          )}
        </View>
      </TouchableOpacity>
      <AppModal
        onConfirm={() => onSubmit(selected)}
        onClose={() => setIsModal(false)}
        isOpen={isModal}
        header={'Select Image for Exercise'}
      >
        <FlexCenterColumn>
          {selected ? (
            <View style={[styles.image, styles.imageC, { borderWidth: 4, borderColor: colors.primary }]}>
              <Image source={{ uri: selected }} style={styles.image} />
            </View>
          ) : (
            <Icon name={icon.empty} size={60} />
          )}
          <TapBar
            values={tabBarValues}
            currentValue={filter}
            onChange={value => setFilter(value as ExerciseImageFilterType)}
          />
          <ScrollView style={{ height: screen.vh - 400 }}>
            <View style={styles.listContainer}>
              {exerciseImages
                ?.filter(img => img.filter === filter)
                ?.map(image => (
                  <TouchableOpacity
                    key={image.storageKey}
                    onPress={() => setSelected(image.downloadUrl)}
                    style={styles.imageCard}
                  >
                    <AppImage src={image.downloadUrl} size={60} />
                    <TextSecondary numberOfLines={1}>{image.fileName}</TextSecondary>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </FlexCenterColumn>
      </AppModal>
    </>
  )
}
