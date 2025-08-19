import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { createShop } from "@/api/shopApi"
import { CreateShopInterface } from "@/interface/shopInterface"

export const useCreateShop = () => {
    const navigate = useNavigate()

    const { mutate, isLoading } = useMutation<any, any, CreateShopInterface>({
        mutationFn: async (data: CreateShopInterface) => {
            return await createShop(data)
        },
        onSuccess: () => {
            toast.success("Shop created successfully!")
            navigate("/")
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create shop")
        },
    })

    return { mutate, isLoading }
}
