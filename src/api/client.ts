import createClient from 'openapi-fetch'
import type { paths } from './OPENAPIClient'

const CSRF_COOKIE = 'flow_csrf'
const CSRF_HEADER = 'X-CSRF-Token'

function readCookie(name: string): string {
  for (const part of document.cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return ''
}

export const client = createClient<paths>({
  baseUrl: '/api/v1',
  credentials: 'include',
})

// Cookie sessions need the CSRF token echoed back on every mutating request
// (internal/auth checks it against the flow_csrf cookie) — see
// internal/auth/sessions.go on the backend.
client.use({
  onRequest({ request }) {
    const method = request.method.toUpperCase()
    if (method === 'GET' || method === 'HEAD') {
      return request
    }
    const csrf = readCookie(CSRF_COOKIE)
    if (csrf) {
      request.headers.set(CSRF_HEADER, csrf)
    }
    return request
  },
})
