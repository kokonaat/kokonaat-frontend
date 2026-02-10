import axios from 'axios'
import { apiEndpoints, BASE_URL } from '@/config/api'

// axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token')
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
})

// handle token refresh on 401; 403 on refresh = invalid/expired refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        localStorage.clear()
        if (window.location.pathname !== '/sign-in') {
          window.location.href = '/sign-in'
        }
        return Promise.reject(error)
      }

      try {
        const res = await axiosInstance.post(apiEndpoints.auth.refresh, {
          refreshToken,
        })
        const { access_token, refresh_token } = res.data

        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        originalRequest.headers['Authorization'] = `Bearer ${access_token}`
        return axiosInstance(originalRequest)
      } catch (err: unknown) {
        // 403 or any refresh failure: invalid/expired refresh or user inactive
        localStorage.clear()
        if (window.location.pathname !== '/sign-in') {
          window.location.href = '/sign-in'
        }
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)
