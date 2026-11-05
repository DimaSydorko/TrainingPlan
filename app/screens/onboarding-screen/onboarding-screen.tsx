import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ConfirmButton, MyTextInput } from '@common'
import AppText from '@common/app-text/app-text'
import { useSessionUserId } from '@stores/session/use-session-store'
import useCompleteOnboarding from '@services/profiles/use-complete-onboarding'
import { SEX, TRAINING_EXPERIENCE } from '@services/profiles/profile-options'
import type { OnboardingAnswers } from '@services/profiles/types'
import { useAppTheme } from '@theme/use-app-theme'
import OnboardingOption from './components/onboarding-option'
import { BODY_WEIGHT_LIMITS_KG, ONBOARDING_STEP, ONBOARDING_STEPS } from './onboarding-screen.constants'
import styles from './onboarding-screen.styles'

const parseBodyWeight = (value: string) => {
  const weight = Number(value.replace(',', '.'))
  return weight >= BODY_WEIGHT_LIMITS_KG.MIN && weight <= BODY_WEIGHT_LIMITS_KG.MAX ? weight : undefined
}

const OnboardingScreen = () => {
  const { t } = useTranslation('onboarding')
  const { colors } = useAppTheme()
  const userId = useSessionUserId()
  const { completeOnboarding } = useCompleteOnboarding()
  const [stepIdx, setStepIdx] = useState(0)
  const [answers, setAnswers] = useState<OnboardingAnswers>({})
  const [bodyWeightInput, setBodyWeightInput] = useState('')
  const step = ONBOARDING_STEPS[stepIdx]
  const bodyWeightKg = parseBodyWeight(bodyWeightInput)
  const isBodyWeightInvalid = !!bodyWeightInput && !bodyWeightKg

  const handleNext = useCallback(
    (answer: OnboardingAnswers = {}) => {
      const nextAnswers = { ...answers, ...answer }
      setAnswers(nextAnswers)
      if (stepIdx < ONBOARDING_STEPS.length - 1) setStepIdx(stepIdx + 1)
      else if (userId) completeOnboarding(userId, nextAnswers)
    },
    [answers, stepIdx, userId, completeOnboarding]
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID='onboarding.screen'>
      <AppText variant='caption' tone='secondary'>
        {`${stepIdx + 1} / ${ONBOARDING_STEPS.length}`}
      </AppText>
      <AppText variant='title'>{t(`onboarding:steps.${step}.title`)}</AppText>
      <AppText tone='secondary' style={styles.hint}>
        {t(`onboarding:steps.${step}.hint`)}
      </AppText>

      <View style={styles.options}>
        {step === ONBOARDING_STEP.SEX &&
          Object.values(SEX).map(sex => (
            <OnboardingOption
              key={sex}
              label={t(`onboarding:sex.${sex}`)}
              testID={`onboarding.${sex}`}
              onPress={() => handleNext({ sex })}
            />
          ))}
        {step === ONBOARDING_STEP.EXPERIENCE &&
          Object.values(TRAINING_EXPERIENCE).map(trainingExperience => (
            <OnboardingOption
              key={trainingExperience}
              label={t(`onboarding:experience.${trainingExperience}`)}
              testID={`onboarding.${trainingExperience}`}
              onPress={() => handleNext({ trainingExperience })}
            />
          ))}
        {step === ONBOARDING_STEP.BODY_WEIGHT && (
          <>
            <MyTextInput
              value={bodyWeightInput}
              onChangeText={setBodyWeightInput}
              placeholder={t('onboarding:bodyWeightPlaceholder')}
              keyboardType='decimal-pad'
              testID='onboarding.bodyWeight'
            />
            {isBodyWeightInvalid && (
              <AppText variant='caption' tone='danger'>
                {t('onboarding:invalidBodyWeight')}
              </AppText>
            )}
            <ConfirmButton
              header={t('onboarding:next')}
              disabled={!bodyWeightKg}
              onPress={() => handleNext({ bodyWeightKg })}
              testID='onboarding.next'
            />
          </>
        )}
      </View>

      <AppText
        variant='link'
        color={colors.primary}
        style={styles.skip}
        onPress={() => handleNext()}
        testID='onboarding.skip'
      >
        {t('onboarding:skip')}
      </AppText>
    </View>
  )
}

export default OnboardingScreen
