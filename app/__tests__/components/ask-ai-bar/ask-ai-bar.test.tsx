import { fireEvent, render, screen } from '@testing-library/react-native'
import AskAiBar from '@components/ask-ai-bar/ask-ai-bar'
import { resetTestStores } from '../../utils/reset-test-stores'

describe('AskAiBar', () => {
  beforeEach(() => {
    resetTestStores()
  })

  it('disables sending until a question is typed', async () => {
    await render(<AskAiBar bottomInset={0} />)

    expect(screen.getByTestId('aiBar.send').props.accessibilityState.disabled).toBe(true)

    await fireEvent.changeText(screen.getByTestId('aiBar.input'), 'Plan my leg day')

    expect(screen.getByTestId('aiBar.send').props.accessibilityState.disabled).toBe(false)
  })

  it('clears the question and shows the coming soon reply on send', async () => {
    await render(<AskAiBar bottomInset={0} />)

    await fireEvent.changeText(screen.getByTestId('aiBar.input'), 'Plan my leg day')
    await fireEvent.press(screen.getByTestId('aiBar.send'))

    expect(screen.getByTestId('aiBar.input').props.value).toBe('')
    expect(screen.getByText('AI answers are coming soon')).toBeOnTheScreen()
  })

  it('hides the reply when a new question is typed', async () => {
    await render(<AskAiBar bottomInset={0} />)

    await fireEvent.changeText(screen.getByTestId('aiBar.input'), 'Plan my leg day')
    await fireEvent(screen.getByTestId('aiBar.input'), 'submitEditing')
    await fireEvent.changeText(screen.getByTestId('aiBar.input'), 'And arms')

    expect(screen.queryByTestId('aiBar.reply')).toBeNull()
  })
})
