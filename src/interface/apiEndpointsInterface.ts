export interface ApiEndpoints {
  auth: {
    signUp: string
    signIn: string
    refresh: string
    logout: string
    forgetPassword: string
    resetPassword: string
    changePassword: string
  }
  shop: {
    createShop: string
    shopList: string
    updateShop: string
    deleteShop: string
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
    customerAnalytics: string
  }
  vendor: {
    vendorList: string
    createVendor: string
    updateVendor: string
    deleteVendor: string
    getVendorById: string
    vendorTransactions: string
    vendorAnalytics: string
  }
  transactions: {
    transactionsList: string
    createTransactions: string
    getTransactionById: string
    updateTransaction: string
    deleteTransaction: string
    transactionLedger: string
  }
  uom: {
    uomList: string
    createUom: string
    updateUom: string
    deleteUom: string
    getUomById: string
  }
  inventory: {
    inventoryList: string
    createInventory: string
    updateInventory: string
    deleteInventory: string
    getInventoryById: string
    inventoryTrackingById: string
  }
  expense: {
    expenseList: string
    createExpense: string
    updateExpense: string
    deleteExpense: string
    getExpenseById: string
  }
  loan: {
    loanList: string
    createLoan: string
    updateLoan: string
    deleteLoan: string
    getLoanById: string
    payLoan: string
    loanSummary: string
  }
  user: {
    currentUser: string
    userList: string
    allRoles: string
    assignableRoles: string
    createUser: string
    updateEmployee: string
    resetEmployeePassword: string
    employeePermissions: string
    modulePermissions: string
    changePassword: string
  }
  subscriptionPlans: {
    subscriptionList: string
    myPlan: string
    createSubscriptionPlan: string
    updateSubscriptionPlan: string
    getSubscriptionPlanById: string
    deleteSubscriptionPlan: string
  }
  reports: {
    reportTransactions: string
    reportStocks: string
    reportStockTrack: string
    reportExpenses: string
    reportBalanceSheet: string
  }
}