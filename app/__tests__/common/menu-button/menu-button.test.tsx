import { fireEvent, render, screen } from '@testing-library/react-native'
import { DrawerActions } from '@react-navigation/native'
import MenuButton from '@common/menu-button/menu-button'
import { resetTestStores } from '../../utils/reset-test-stores'

const mockDispatch = jest.fn()

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ dispatch: mockDispatch }),
}))

describe('MenuButton', () => {
  beforeEach(() => {
    resetTestStores()
    mockDispatch.mockClear()
  })

  it('opens the sidebar drawer', async () => {
    await render(<MenuButton />)

    await fireEvent.press(screen.getByTestId('header.menu'))

    expect(mockDispatch).toHaveBeenCalledWith(DrawerActions.openDrawer())
  })

  it('is labelled for screen readers', async () => {
    await render(<MenuButton />)

    expect(screen.getByLabelText('Open menu')).toBeOnTheScreen()
  })
})
