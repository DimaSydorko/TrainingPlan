import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { useSessionStore } from '@stores/session/use-session-store'
import OnboardingScreen from '@screens/onboarding-screen/onboarding-screen'

const mockCompleteOnboarding = jest.fn()

jest.mock('@services/profiles/use-complete-onboarding', () => ({
  __esModule: true,
  default: () => ({ completeOnboarding: mockCompleteOnboarding }),
}))

describe('OnboardingScreen', () => {
  beforeEach(() => {
    mockCompleteOnboarding.mockClear()
    useSessionStore.setState({ userId: 'u1' })
  })

  it('collects one answer per step and saves them at the end', async () => {
    await render(<OnboardingScreen />)

    await fireEvent.press(screen.getByTestId('onboarding.female'))
    await fireEvent.press(screen.getByTestId('onboarding.lt_1y'))
    await fireEvent.changeText(screen.getByTestId('onboarding.bodyWeight'), '62,5')
    await fireEvent.press(screen.getByTestId('onboarding.next'))

    expect(mockCompleteOnboarding).toHaveBeenCalledWith('u1', {
      sex: 'female',
      trainingExperience: 'lt_1y',
      bodyWeightKg: 62.5,
    })
  })

  it('lets every step be skipped', async () => {
    await render(<OnboardingScreen />)

    await fireEvent.press(screen.getByTestId('onboarding.skip'))
    await fireEvent.press(screen.getByTestId('onboarding.skip'))
    await fireEvent.press(screen.getByTestId('onboarding.skip'))

    expect(mockCompleteOnboarding).toHaveBeenCalledWith('u1', {})
  })

  it('does not accept an impossible body weight', async () => {
    await render(<OnboardingScreen />)
    await fireEvent.press(screen.getByTestId('onboarding.skip'))
    await fireEvent.press(screen.getByTestId('onboarding.skip'))

    await fireEvent.changeText(screen.getByTestId('onboarding.bodyWeight'), '900')

    expect(screen.getByText('Enter a weight between 20 and 400 kg.')).toBeOnTheScreen()
    await fireEvent.press(screen.getByTestId('onboarding.next'))
    expect(mockCompleteOnboarding).not.toHaveBeenCalled()
  })
})
