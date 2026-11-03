import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context'
import AiBarScreenLayout from '@routers/ai-bar-screen-layout'
import { resetTestStores } from '../utils/reset-test-stores'

const DEVICE_INSETS = { top: 24, right: 0, bottom: 34, left: 0 }

function BottomInsetProbe() {
  const { bottom } = useSafeAreaInsets()

  return <Text testID='probe'>{bottom}</Text>
}

function renderLayout(isAiBarVisible: boolean) {
  return render(
    <SafeAreaInsetsContext.Provider value={DEVICE_INSETS}>
      <AiBarScreenLayout isAiBarVisible={isAiBarVisible}>
        <BottomInsetProbe />
      </AiBarScreenLayout>
    </SafeAreaInsetsContext.Provider>
  )
}

describe('AiBarScreenLayout', () => {
  beforeEach(() => {
    resetTestStores()
  })

  it('docks the AI bar and lets it own the bottom inset', async () => {
    await renderLayout(true)

    expect(screen.getByTestId('aiBar.container')).toBeOnTheScreen()
    expect(screen.getByTestId('probe')).toHaveTextContent('0')
  })

  it('hides the AI bar and keeps the device inset for the screen', async () => {
    await renderLayout(false)

    expect(screen.queryByTestId('aiBar.container')).toBeNull()
    expect(screen.getByTestId('probe')).toHaveTextContent('34')
  })
})
