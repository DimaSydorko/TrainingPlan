import { memo, useCallback, useState } from 'react'
import { TextInput, View } from 'react-native'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { useTranslation } from 'react-i18next'

import AppText from '@common/app-text/app-text'
import IconButton from '@common/icon-button/icon-button'
import { Icon } from '@common/icon/icon'
import Stack from '@common/stack/stack'
import { icon } from '@theme/icons'
import { spacing } from '@theme/tokens'
import { useThemeColors } from '@theme/use-app-theme'
import { ASK_AI_BAR_ICON_SIZE, ASK_AI_INPUT_MAX_LENGTH } from './ask-ai-bar.constants'
import styles from './ask-ai-bar.styles'

export type AskAiBarProps = {
  bottomInset: number
}

const AskAiBar = ({ bottomInset }: AskAiBarProps) => {
  const { t } = useTranslation('common')
  const colors = useThemeColors()
  const [question, setQuestion] = useState('')
  const [isReplyVisible, setIsReplyVisible] = useState(false)
  const isSendDisabled = !question.trim()

  const handleChangeQuestion = useCallback((text: string) => {
    setQuestion(text)
    setIsReplyVisible(false)
  }, [])

  const handleSend = useCallback(() => {
    if (!question.trim()) return
    setQuestion('')
    setIsReplyVisible(true)
  }, [question])

  return (
    <KeyboardStickyView offset={{ opened: bottomInset }}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.surfaceElevated,
            shadowColor: colors.shadow,
            paddingBottom: spacing.sm + bottomInset,
          },
        ]}
        testID='aiBar.container'
      >
        {isReplyVisible && (
          <AppText variant='caption' tone='secondary' style={styles.reply} testID='aiBar.reply'>
            {t('common:askAi.comingSoon')}
          </AppText>
        )}
        <Stack
          preset='start'
          gap='sm'
          style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Icon name={icon.aiSparkles} size={ASK_AI_BAR_ICON_SIZE} color={colors.accent} />
          <TextInput
            value={question}
            onChangeText={handleChangeQuestion}
            onSubmitEditing={handleSend}
            placeholder={t('common:askAi.placeholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.textPrimary }]}
            maxLength={ASK_AI_INPUT_MAX_LENGTH}
            returnKeyType='send'
            submitBehavior='blurAndSubmit'
            accessibilityLabel={t('common:askAi.placeholder')}
            testID='aiBar.input'
          />
          <IconButton
            iconName={icon.send}
            onPress={handleSend}
            disabled={isSendDisabled}
            color={colors.accent}
            size={ASK_AI_BAR_ICON_SIZE}
            style={styles.sendButton}
            accessibilityLabel={t('common:askAi.send')}
            testID='aiBar.send'
          />
        </Stack>
      </View>
    </KeyboardStickyView>
  )
}

export default memo(AskAiBar)
