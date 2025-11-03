import ContentSection from '../components/content-section'
import NotificationsForm from './notifications-form'

const SettingsNotifications = () => {
  return (
    <ContentSection
      title='Notifications'
      desc='Configure how you receive notifications.'
    >
      <NotificationsForm />
    </ContentSection>
  )
}

export default SettingsNotifications
