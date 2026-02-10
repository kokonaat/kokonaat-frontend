import type { ApiEndpoints } from '@/interface/apiEndpointsInterface'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL!

export const apiEndpoints: ApiEndpoints = {
  auth: {
    signUp: '/auth/signup',
    signIn: '/auth/signin',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgetPassword: '/auth/forget-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
  },
  dashbaord: {
    dashboardReport: '/report/dashboard',
  },
  shop: {
    createShop: '/shop',
    shopList: '/shop',
    updateShop: '/shop/',
  },
  designation: {
    designationList: '/designation',
    createDesignation: '/designation',
    updateDesignation: '/designation',
    deleteDesignation: '/designation',
  },
  customer: {
    customerList: '/customer',
    createCustomer: '/customer',
    updateCustomer: '/customer',
    deleteCustomer: '/customer',
    getCustomerById: '/customer/id',
    customerTransactions: '/transaction/customer/id',
  },
  vendor: {
    vendorList: '/vendor',
    createVendor: '/vendor',
    updateVendor: '/vendor',
    deleteVendor: '/vendor',
    getVendorById: '/vendor/id',
    vendorTransactions: '/transaction/vendor/id',
  },
  transactions: {
    transactionsList: '/transactions',
    createTransactions: '/transactions',
    getTransactionById: '/transactions/{id}',
    transactionLedger: '/transaction/ledger/{customerOrVendorId}',
  },
  uom: {
    uomList: '/unit-of-measurement',
    createUom: '/unit-of-measurement',
    updateUom: '/unit-of-measurement/{id}',
    deleteUom: '/unit-of-measurement/{id}',
    getUomById: '/unit-of-measurement/{id}',
  },
  inventory: {
    inventoryList: '/inventory',
    createInventory: '/inventory',
    updateInventory: '/inventory',
    deleteInventory: '/inventory',
    getInventoryById: '/inventory/id',
    inventoryTrackingById: '/inventory-tracking/{inventoryId}',
  },
  expense: {
    expenseList: '/expense',
    createExpense: '/expense',
    updateExpense: '/expense/{id}',
    deleteExpense: '/expense/{id}',
    getExpenseById: '/expense/{id}',
  },
  user: {
    currentUser: '/user/me',
    userList: '/user/get-users-by-shop-id',
    allRoles: '/user/role/get-roles',
    createUser: '/user/add-user-to-shop',
    changePassword: '/user/change-password',
  },
  subscriptionPlans: {
    subscriptionList: '/subscription/plans',
    createSubscriptionPlan: '/subscription/plans',
    updateSubscriptionPlan: '/subscription/plans/{id}',
    getSubscriptionPlanById: '/subscription/plans/{id}',
    deleteSubscriptionPlan: '/subscription/plans/{id}',
  },
  reports : {
    reportTransactions: '/report/transactions',
    reportStocks: '/report/stocks',
    reportStockTrack: '/report/stocks/track',
    reportExpenses: '/report/expenses',
    reportBalanceSheet: '/report/balance-sheet',
  }
}