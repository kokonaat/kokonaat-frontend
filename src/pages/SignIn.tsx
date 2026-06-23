import SignInForm from '@/components/signIn/SignInForm'
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
import { useTranslation } from '@/hooks/useTranslation'

const SignIn = () => {
    const { t } = useTranslation('auth')

    return (
        <AuthLayout>
            <Card className='gap-4'>
                <CardHeader>
                    <CardTitle className='text-lg tracking-tight'>{t('signIn.title')}</CardTitle>
                    <CardDescription>
                        {t('signIn.description')} <br />
                        {t('signIn.noAccount')}{' '}
                        <Link
                            to='/sign-up'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            {t('signIn.signUpLink')}
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignInForm />
                </CardContent>
                <CardFooter>
                    <p className='text-muted-foreground px-8 text-center text-sm'>
                        {t('signIn.termsPrefix')}{' '}
                        <a
                            href='/terms'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            {t('signIn.termsOfService')}
                        </a>{' '}
                        {t('signIn.and')}{' '}
                        <a
                            href='/privacy'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            {t('signIn.privacyPolicy')}
                        </a>
                        .
                    </p>
                </CardFooter>
            </Card>
        </AuthLayout>
    )
}

export default SignIn
