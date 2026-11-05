import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import EffortRatingModal from '@components/effort-rating-modal/effort-rating-modal'

describe('EffortRatingModal', () => {
  it('saves the selected rating', async () => {
    const onSave = jest.fn()
    await render(<EffortRatingModal isOpen onSave={onSave} onClose={jest.fn()} />)

    await fireEvent.press(screen.getByTestId('effortRating.option4'))
    await fireEvent.press(screen.getByTestId('appModal.confirm'))

    expect(onSave).toHaveBeenCalledWith(4)
  })

  it('saves without a rating when none or the same one twice is picked', async () => {
    const onSave = jest.fn()
    await render(<EffortRatingModal isOpen onSave={onSave} onClose={jest.fn()} />)

    await fireEvent.press(screen.getByTestId('effortRating.option2'))
    await fireEvent.press(screen.getByTestId('effortRating.option2'))
    await fireEvent.press(screen.getByTestId('appModal.confirm'))

    expect(onSave).toHaveBeenCalledWith(undefined)
  })
})
