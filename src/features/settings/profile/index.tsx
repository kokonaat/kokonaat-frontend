import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

const SettingsProfile = () => {
  return (
    <ContentSection
      title='Profile'
      desc='This is how others will see you on the site.'
    >
      <ProfileForm />
    </ContentSection>
  )
}

export default SettingsProfile