import * as React from 'react'
import { useState } from 'react'
import { FlatList, Image, TouchableOpacity, View } from 'react-native'
import { Icon } from '@common/icon/icon'
import { useWorkout } from '@hooks/redux'
import { useAppTheme } from '@theme/use-app-theme'
import { useScreen } from '@platform/screen'
import { AppImage, AppModal, TapBar } from '@common'
import { ExerciseImageFilterType } from '@utils/types'
import AppText from '@common/app-text/app-text'
import Stack from '@common/stack/stack'
import { icon } from '@theme/icons'
import styles from './styles'
import { IMAGE_LIST_RESERVED_HEIGHT } from './image-selector.constants'

type ImageSelectorProps = {
  value?: string
  onSubmit: (imageUrl: string) => void
}

const tabBarValues: ExerciseImageFilterType[] = ['home', 'street', 'gym']

export default function ImageSelector({ onSubmit, value = '' }: ImageSelectorProps) {
  const { colors } = useAppTheme()
  const { exerciseImages } = useWorkout()
  const [isModal, setIsModal] = useState(false)
  const [selected, setSelected] = useState<string>(value)
  const [filter, setFilter] = useState<ExerciseImageFilterType>('home')
  const { height } = useScreen()
  const listStyle = { height: height - IMAGE_LIST_RESERVED_HEIGHT }

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
        <Stack preset='centerColumn'>
          <View style={styles.selectedContainer}>
            {selected ? (
              <View style={[styles.image, styles.imageC, styles.selectedImage, { borderColor: colors.primary }]}>
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
            style={listStyle}
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
                  <AppText variant='caption' tone='secondary' numberOfLines={1}>
                    {item.fileName}
                  </AppText>
                </TouchableOpacity>
              </>
            )}
          />
        </Stack>
      </AppModal>
    </>
  )
}
