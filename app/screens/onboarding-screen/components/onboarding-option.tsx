import { TouchableOpacity } from 'react-native'

import AppText from '@common/app-text/app-text'
import { useAppTheme } from '@theme/use-app-theme'
import styles from './onboarding-option.styles'

type OnboardingOptionProps = {
  label: string
  testID: string
  onPress: () => void
}

const OnboardingOption = ({ label, testID, onPress }: OnboardingOptionProps) => {
  const { colors } = useAppTheme()

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      style={[styles.option, { borderColor: colors.primary, backgroundColor: colors.surfaceElevated }]}
    >
      <AppText variant='bodyStrong'>{label}</AppText>
    </TouchableOpacity>
  )
}

export default OnboardingOption
