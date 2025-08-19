import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'

// Context Providers
import { ThemeProvider } from './context/theme-provider'
import { FontProvider } from './context/font-provider'
import { DirectionProvider } from './context/direction-provider'
import { SidebarProvider } from './components/ui/sidebar'
import { AxiosError } from 'axios'
import { LayoutProvider } from './context/layout-provider'
import { SearchProvider } from './context/search-provider'
import { handleServerError } from './utils/handle-server-error'
import ForgotPassword from './features/auth/forgot-password'
import Otp from './features/auth/otp'
import './styles/index.css'
import { Tasks } from './features/tasks'
import Apps from './features/apps'
import { Users } from './features/users'
import AuthenticatedLayout from './components/layout/authenticated-layout'
import UnauthorisedError from './features/errors/unauthorized-error'
import ForbiddenError from './features/errors/forbidden'
import NotFoundError from './features/errors/not-found-error'
import MaintenanceError from './features/errors/maintenance-error'
import GeneralError from './features/errors/general-error'
import Settings from './features/settings'
import ComingSoon from './components/coming-soon'
import CreateShop from './pages/CreateShop'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'


// --- React Query Setup ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })
        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10000,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)
        if (error instanceof AxiosError && error.response?.status === 304) {
          toast.error('Content not modified!')
        }
      },
    },
  },
})

// --- Render App ---
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <BrowserRouter>
                <LayoutProvider>
                  <SidebarProvider>
                    <SearchProvider>
                      <Routes>
                        <Route path="/sign-in" element={<SignIn />} />
                        <Route path="/sign-up" element={<SignUp />} />
                        <Route path="/create-shop" element={<CreateShop />} />
                        <Route element={<AuthenticatedLayout />}>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/users" element={<Users />} />
                          <Route path="/apps" element={<Apps />} />
                          <Route path="/tasks" element={<Tasks />} />
                          {/* Public routes */}
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/otp" element={<Otp />} />
                          <Route path="/errors/unauthorized" element={<UnauthorisedError />} />
                          <Route path="/errors/forbidden" element={<ForbiddenError />} />
                          <Route path="/errors/maintenance-error" element={<MaintenanceError />} />
                          <Route path="/errors/not-found" element={<NotFoundError />} />
                          <Route path="/errors/internal-server-error" element={<GeneralError />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/help-center" element={<ComingSoon />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                      </Routes>
                    </SearchProvider>
                  </SidebarProvider>
                </LayoutProvider>
              </BrowserRouter>
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}