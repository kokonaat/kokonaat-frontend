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