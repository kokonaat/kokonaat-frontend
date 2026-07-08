import {
    createSubscriptionPlan,
    deleteSubscriptionPlan,
    getMyPlan,
    getSubscriptionById,
    subscriptionPlanList,
    updateSubscriptionPlan,
} from "@/api/plansApi"
import type {
    CreateSubscriptionPlanDto,
    SubscriptionPlanInterface,
    UpdateSubscriptionPlanParams,
} from "@/interface/subscriptionInterface"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const SUBSCRIPTION_KEYS = {
    all: ["subscriptionPlans"] as const,
    myPlan: ["subscriptionPlans", "myPlan"] as const,
    detail: (id: string) => ["subscriptionPlans", id] as const,
}

// all plans (public listing)
export const useSubscriptionList = (options?: { enabled?: boolean }) =>
    useQuery<SubscriptionPlanInterface[]>({
        queryKey: SUBSCRIPTION_KEYS.all,
        queryFn: subscriptionPlanList,
        enabled: options?.enabled !== false,
        placeholderData: [],
    })

// current user's active plan
export const useMyPlan = (options?: { enabled?: boolean }) =>
    useQuery<SubscriptionPlanInterface | null>({
        queryKey: SUBSCRIPTION_KEYS.myPlan,
        queryFn: getMyPlan,
        enabled: options?.enabled !== false,
    })

// detail by id
export const useSubscriptionDetail = (id: string, options?: { enabled?: boolean }) =>
    useQuery<SubscriptionPlanInterface>({
        queryKey: SUBSCRIPTION_KEYS.detail(id),
        queryFn: () => getSubscriptionById(id),
        enabled: options?.enabled !== false && !!id,
    })

// create
export const useCreateSubscriptionPlan = () => {
    const queryClient = useQueryClient()

    return useMutation<SubscriptionPlanInterface, Error, CreateSubscriptionPlanDto>({
        mutationFn: createSubscriptionPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.all })
        },
    })
}

// update
export const useUpdateSubscriptionPlan = () => {
    const queryClient = useQueryClient()

    return useMutation<SubscriptionPlanInterface, Error, UpdateSubscriptionPlanParams>({
        mutationFn: ({ id, data }) => updateSubscriptionPlan(id, data),
        onSuccess: (updatedPlan) => {
            queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.all })
            queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.detail(updatedPlan.id) })
        },
    })
}

// delete
export const useDeleteSubscriptionPlan = () => {
    const queryClient = useQueryClient()

    return useMutation<void, Error, string>({
        mutationFn: (id: string) => deleteSubscriptionPlan(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.all })
            queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.detail(id) })
        },
    })
}