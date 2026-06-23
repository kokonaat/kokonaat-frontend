import type { TFunction } from 'i18next'
import z from 'zod'

export const createSubscriptionFormSchema = (t: TFunction) =>
    z.object({
        name: z.string().min(1, t('subscriptionForm.planNameRequired')),
        description: z.string().min(1, t('subscriptionForm.descriptionRequired')),
        price: z.number().min(0, { message: t('subscriptionForm.priceMin') }),
        totalTransactions: z.number().min(0, {
            message: t('subscriptionForm.transactionsMin'),
        }),
        dashboardAccess: z.boolean(),
    })

export type SubscriptionFormValues = z.infer<
    ReturnType<typeof createSubscriptionFormSchema>
>
