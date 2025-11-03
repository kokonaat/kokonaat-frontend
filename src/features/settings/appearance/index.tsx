import ContentSection from '../components/content-section'
import AppearanceForm from './appearance-form'

const SettingsAppearance = () => {
  return (
    <ContentSection
      title='Appearance'
      desc='Customize the appearance of the app. Automatically switch between day
          and night themes.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}

export default SettingsAppearance
