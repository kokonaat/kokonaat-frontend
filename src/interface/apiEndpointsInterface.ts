export interface ApiEndpoints {
  auth: {
    signUp: string
    signIn: string
    refresh: string
  }
  shop: {
    createShop: string
    shopList: string
    updateShop: string
  }
  dashbaord: {
    dashboardReport: string
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
    getCustomerById: string
    customerTransactions: string
  }
  vendor: {
    vendorList: string
    createVendor: string
    updateVendor: string
    deleteVendor: string
    getVendorById: string
    vendorTransactions: string
  }
  transactions: {
    transactionsList: string
    createTransactions: string
    getTransactionById: string
    transactionLedger: string
  }
  inventory: {
    inventoryList: string
    createInventory: string
    updateInventory: string
    deleteInventory: string
    getInventoryById: string
    inventoryTrackingById: string
  }
  user: {
    currentUser: string
    userList: string
    allRoles: string
    createUser: string
    changePassword: string
  }
}