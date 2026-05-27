import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  user: any | null
  access_token: string | null
  refresh_token: string | null
  setAuth: (user: any, access_token: string, refresh_token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      setAuth: (user, access_token, refresh_token) =>
        set({ user, access_token, refresh_token }),
      clearAuth: () =>
        set({ user: null, access_token: null, refresh_token: null }),
    }),
    { name: "auth" } // disimpan di localStorage
  )
)