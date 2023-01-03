import * as React from 'react'
import { useState } from 'react'
import { FlatList, Image, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSettings, useWorkout } from '../../Hooks/redux'
import { appScreen } from '../../Utils/constants'
import { AppImage, AppModal, TapBar } from '../../Common'
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
            <Icon name={icon.image} color={colors.textSecondary} size={30} />
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
          <View style={styles.selectedContainer}>
            {selected ? (
              <View style={[styles.image, styles.imageC, { borderWidth: 4, borderColor: colors.primary }]}>
                <Image source={{ uri: selected }} style={styles.image} />
              </View>
            ) : (
              <Icon name={icon.image} color={colors.textSecondary} size={66} />
            )}
          </View>
          <TapBar
            values={tabBarValues}
            currentValue={filter}
            onChange={value => setFilter(value as ExerciseImageFilterType)}
          />
          <FlatList
            data={exerciseImages?.filter(img => img.filter === filter)}
            numColumns={4}
            style={{ height: appScreen.vh - 400 }}
            renderItem={({ item, index }) => (
              <>
                {index === 0 && (
                  <TouchableOpacity style={[styles.imageCard, styles.emptySelect]} onPress={() => setSelected('')}>
                    <Icon name={icon.image} color={colors.textSecondary} size={66} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  key={item.storageKey}
                  onPress={() => setSelected(item.downloadUrl)}
                  style={styles.imageCard}
                >
                  <AppImage src={item.downloadUrl} size={60} />
                  <TextSecondary numberOfLines={1}>{item.fileName}</TextSecondary>
                </TouchableOpacity>
              </>
            )}
          />
        </FlexCenterColumn>
      </AppModal>
    </>
  )
}
