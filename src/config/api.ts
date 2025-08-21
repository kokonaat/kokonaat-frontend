export const API = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL,

    AUTH: {
        SIGNUP: import.meta.env.VITE_API_AUTH_SIGNUP,
        SIGNIN: import.meta.env.VITE_API_AUTH_SIGNIN,
    },

    SHOP: {
        CREATE_SHOP: import.meta.env.VITE_API_CREATE_SHOP,
        SHOP_LIST: import.meta.env.VITE_API_SHOP_LIST,
        UPDATE_SHOP: import.meta.env.VITE_API_UPDATE_SHOP
    }
}
