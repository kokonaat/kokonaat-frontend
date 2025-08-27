export interface ApiEndpoints {
    auth: {
        signUp: string
        signIn: string
    }
    shop: {
        createShop: string
        shopList: string
        updateShop: string
    }
    designation: {
        designationList: string
        createDesignation: string
        updateDesignation: string
        deleteDesignation: string
    }
    customer: {
        customerList: string
        createCustomer: string
        updateCustomer: string
        deleteCustomer: string
    }
    vendor: {
        vendorList: string
        createVendor: string
        updateVendor: string
        deleteVendor: string
    }
}