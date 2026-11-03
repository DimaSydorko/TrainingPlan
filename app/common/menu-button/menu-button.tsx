import { useCallback } from 'react'
import { DrawerActions, useNavigation } from '@react-navigation/native'

import { icon } from '@theme/icons'
import { useThemeColors } from '@theme/use-app-theme'
import IconButton from '../icon-button/icon-button'
import { MENU_BUTTON_ICON_SIZE } from './menu-button.constants'
import styles from './menu-button.styles'

const MenuButton = () => {
  const navigation = useNavigation()
  const colors = useThemeColors()

  const handleOpenMenu = useCallback(() => navigation.dispatch(DrawerActions.openDrawer()), [navigation])

  return (
    <IconButton
      iconName={icon.menu}
      onPress={handleOpenMenu}
      color={colors.textPrimary}
      size={MENU_BUTTON_ICON_SIZE}
      style={styles.button}
      accessibilityLabel='Open menu'
      testID='header.menu'
    />
  )
}

export default MenuButton
