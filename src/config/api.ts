import { ApiEndpoints } from "@/interface/apiEndpointsInterface"

export const BASE_URL = import.meta.env.VITE_API_BASE_URL!

export const apiEndpoints: ApiEndpoints = {
    auth: {
        signUp: "/auth/signup",
        signIn: "/auth/signin",
    },
    shop: {
        createShop: "/shop",
        shopList: "/shop",
        updateShop: "/shop/"
    },
    designation: {
        designationList: "/designation",
        createDesignation: "/designation",
        updateDesignation: "/designation",
        deleteDesignation: "/designation",
    }
}
