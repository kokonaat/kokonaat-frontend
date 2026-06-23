import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AuthLayout from '@/components/layout/AuthLayout'
import SignUpForm from '@/components/signUp/SignUpForm'
import { useTranslation } from '@/hooks/useTranslation'

const SignUp = () => {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            {t('signUp.title')}
          </CardTitle>
          <CardDescription>
            {t('signUp.description')} <br />
            {t('signUp.hasAccount')}{' '}
            <Link
              to='/sign-in'
              className='hover:text-primary underline underline-offset-4'
            >
              {t('signUp.signInLink')}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            {t('signUp.termsPrefix')}{' '}
            <a
              href='#'
              className='hover:text-primary underline underline-offset-4'
            >
              {t('signUp.termsOfService')}
            </a>{' '}
            {t('signUp.and')}{' '}
            <a
              href='#'
              className='hover:text-primary underline underline-offset-4'
            >
              {t('signUp.privacyPolicy')}
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}

export default SignUp
