import api from "./axios"

// ── Auth ──
export async function register(data: {
  username: string
  email: string
  password: string
  phone_number: string
}) {
  const res = await api.post("/register", data)
  return res.data
}

export async function login(data: {
  username: string
  password: string
}) {
  const res = await api.post("/login", data)
  return res.data
}

export async function refreshToken(refresh_token: string) {
  const res = await api.post("/refresh", { refresh_token })
  return res.data
}

export async function revokeToken(token: string) {
  const res = await api.post("/revoke", { token })
  return res.data
}

// ── Clients ──
export async function listClients() {
  const res = await api.get("/clients")
  return res.data
}

export async function createClient(data: {
  name: string
  scopes: string[]
  redirect_uris: string[]
}) {
  const res = await api.post("/clients", data)
  return res.data
}