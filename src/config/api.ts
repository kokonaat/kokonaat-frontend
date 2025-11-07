import type { ApiEndpoints } from "@/interface/apiEndpointsInterface"

export const BASE_URL = import.meta.env.VITE_API_BASE_URL!

export const apiEndpoints: ApiEndpoints = {
    auth: {
        signUp: "/auth/signup",
        signIn: "/auth/signin",
    },
    dashbaord: {
        dashboardReport: "/report/dashboard"
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
    },
    customer: {
        customerList: "/customer",
        createCustomer: "/customer",
        updateCustomer: "/customer",
        deleteCustomer: "/customer",
        getCustomerById: "/customer/id",
        customerTransactions: "/transaction/customer/id"
    },
    vendor: {
        vendorList: "/vendor",
        createVendor: "/vendor",
        updateVendor: "/vendor",
        deleteVendor: "/vendor",
        getVendorById: "/vendor/id",
        vendorTransactions: "/transaction/vendor/id"
    },
    transactions: {
        transactionsList: "/transactions",
        createTransactions: "/transactions",
        getTransactionById: "/transactions/{id}",
        transactionLedger: "/transaction/ledger/{customerOrVendorId}"
    },
    inventory: {
        inventoryList: "/inventory",
        createInventory: "/inventory",
        updateInventory: "/inventory",
        deleteInventory: "/inventory",
        getInventoryById: "/inventory/id"
    },
    user: {
        currentUser: "/user/me",
        userList: "/user/get-users-by-shop-id",
        allRoles: "/user/role/get-roles",
        createUser: "/user/add-user-to-shop",
        changePassword: "/user/change-password",
    }
}