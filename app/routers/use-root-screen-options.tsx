import { StackNavigationOptions } from '@react-navigation/stack'

import MenuButton from '@common/menu-button/menu-button'
import { useScreenOptions } from '@theme/navigation-theme'

export default function useRootScreenOptions(title: string): StackNavigationOptions {
  const options = useScreenOptions()

  return { ...options, title, headerLeft: renderMenuButton }
}

function renderMenuButton() {
  return <MenuButton />
}
