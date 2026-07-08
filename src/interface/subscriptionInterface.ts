export type PlanKey = 'free' | 'pro' | 'max'

export interface SubscriptionPlanInterface {
    id: string
    no: string
    planKey: PlanKey
    name: string
    description: string
    price: number       // monthly price
    yearlyPrice: number
    totalTransactions: number // monthly limit; -1 = unlimited
    dashboardAccess: boolean
    maxShops: number    // -1 = unlimited
    maxUsers: number    // -1 = unlimited
    maxVendors: number  // -1 = unlimited
    maxCustomers: number // -1 = unlimited
    maxExpenses: number  // -1 = unlimited
}

export interface CreateSubscriptionPlanDto {
    planKey?: PlanKey
    name: string
    description: string
    price: number
    yearlyPrice?: number
    totalTransactions: number
    dashboardAccess: boolean
    maxShops?: number
    maxUsers?: number
    maxVendors?: number
    maxCustomers?: number
    maxExpenses?: number
}

export interface UpdateSubscriptionPlanParams {
    id: string
    data: Partial<CreateSubscriptionPlanDto>
}

export interface SubscriptionPlanCardProps {
    plan: SubscriptionPlanInterface
}

export interface SubscriptionPlanDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentPlan?: SubscriptionPlanInterface | null
}