export interface UserSignUpInterface {
    name: string,
    phone: string,
    password: string,
    confirmPassword: string,
}

export interface UserSignInInterface {
    phone: string,
    password: string
}

export interface AuthResponseInterface {
    access_token: string,
    refresh_token: string
}

export interface AuthState {
    access_token: string | null
    refresh_token: string | null
    isAuthenticated: boolean
    setTokens: (access: string, refresh: string) => void
    clearTokens: () => void
}