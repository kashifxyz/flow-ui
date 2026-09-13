export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function readCookie(name: string): string {
  const parts = document.cookie.split(';')
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return ''
}

type ErrorBody = {
  error?: { code?: string; message?: string }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const method = (init.method ?? 'GET').toUpperCase()
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (method !== 'GET' && method !== 'HEAD') {
    const csrf = readCookie('flow_csrf')
    if (csrf) {
      headers.set('X-CSRF-Token', csrf)
    }
  }

  const res = await fetch(path, { ...init, credentials: 'include', headers })
  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const err = data as ErrorBody | null
    throw new ApiError(
      res.status,
      err?.error?.code ?? 'error',
      err?.error?.message ?? res.statusText,
    )
  }
  return data as T
}

export type PublicUser = {
  id: string
  email: string
  display_name: string
  email_verified: boolean
}

export function fetchMe(): Promise<PublicUser> {
  return api<PublicUser>('/api/v1/auth/me')
}

export function register(body: { email: string; password: string; display_name?: string }) {
  return api<{ ok: boolean }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function login(body: { email: string; password: string }) {
  return api<PublicUser>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function logout() {
  return api<void>('/api/v1/auth/logout', { method: 'POST' })
}

export function verifyEmail(token: string) {
  return api<{ ok: boolean }>('/api/v1/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export function resendVerification(email: string) {
  return api<void>('/api/v1/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function forgotPassword(email: string) {
  return api<void>('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token: string, password: string) {
  return api<{ ok: boolean }>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}
