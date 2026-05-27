import axios from "axios"
import { useAuthStore } from "@/store/auth"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
})

// ── Request interceptor: selalu attach access token ──
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access_token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: auto refresh kalau 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Kalau 401 dan belum pernah retry
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refresh_token = useAuthStore.getState().refresh_token

        if (!refresh_token) {
          useAuthStore.getState().clearAuth()
          window.location.href = "/login"
          return Promise.reject(error)
        }

        // Minta token baru
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/oauth/refresh`,
          { refresh_token }
        )

        const { access_token, refresh_token: new_refresh } = res.data

        // Update store dengan token baru
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user,
          access_token,
          new_refresh,
        )

        // Retry request original dengan token baru
        original.headers.Authorization = `Bearer ${access_token}`
        return api(original)

      } catch {
        // Refresh gagal → logout
        useAuthStore.getState().clearAuth()
        window.location.href = "/login"
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api