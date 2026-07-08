import { axiosInstance } from "./axios"
import { apiEndpoints } from "@/config/api"
import type {
    CreateUserRequest,
    CreateUserResponse,
    EmployeePermissionsResponse,
    FetchUserListParams,
    ResetEmployeePasswordRequest,
    ShopModulePermissionsResponse,
    UpdateEmployeeRequest,
    UserInterface,
} from "@/interface/userInterface"

export const fetchCurrentUser = async (): Promise<UserInterface> => {
    const res = await axiosInstance.get<UserInterface>(apiEndpoints.user.currentUser)
    return res.data
}

export const fetchUserList = async ({
    shopId,
    page = 1,
    limit = 10,
    searchBy = '',
}: FetchUserListParams): Promise<UserInterface[]> => {
    const res = await axiosInstance.get<UserInterface[]>(apiEndpoints.user.userList, {
        params: {
            shopId,
            page,
            limit,
            searchBy: searchBy || undefined,
        },
    })
    return res.data
}

export const fetchUserRoles = async () => {
    const res = await axiosInstance.get(apiEndpoints.user.allRoles)
    return res.data
}

export const fetchAssignableRoles = async () => {
    const res = await axiosInstance.get(apiEndpoints.user.assignableRoles)
    return res.data
}

export const createUser = async (
    payload: CreateUserRequest
): Promise<CreateUserResponse> => {
    const res = await axiosInstance.post<CreateUserResponse>(
        apiEndpoints.user.createUser,
        payload
    )
    return res.data
}

export const updateEmployee = async (payload: UpdateEmployeeRequest) => {
    const res = await axiosInstance.put(apiEndpoints.user.updateEmployee, payload)
    return res.data
}

export const resetEmployeePassword = async (
    payload: ResetEmployeePasswordRequest
) => {
    const res = await axiosInstance.put(
        apiEndpoints.user.resetEmployeePassword,
        payload
    )
    return res.data
}

export const fetchEmployeePermissions = async (
    userId: string,
    shopId: string
): Promise<EmployeePermissionsResponse> => {
    const res = await axiosInstance.get<EmployeePermissionsResponse>(
        apiEndpoints.user.employeePermissions,
        { params: { userId, shopId } }
    )
    return res.data
}

export const fetchShopModulePermissions = async (
    shopId: string
): Promise<ShopModulePermissionsResponse> => {
    const res = await axiosInstance.get<ShopModulePermissionsResponse>(
        apiEndpoints.user.modulePermissions,
        { params: { shopId } }
    )
    return res.data
}
