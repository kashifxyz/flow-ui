// Kept in sync with internal/auth/validate.go on the backend. Client-side
// validation here is for UX (immediate feedback); the backend remains the
// correctness/security boundary (PROJECT-INFO.md §14).
export const MIN_PASSWORD_LENGTH = 10
export const MAX_PASSWORD_LENGTH = 128

const EMAIL_RE = /^\S+@\S+\.\S+$/

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Email is required'
  }
  if (!EMAIL_RE.test(trimmed)) {
    return 'Enter a valid email address'
  }
  return undefined
}

export function validateNewPassword(value: string): string | undefined {
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters`
  }
  if (value.length > MAX_PASSWORD_LENGTH) {
    return `Use at most ${MAX_PASSWORD_LENGTH} characters`
  }
  return undefined
}

export function validateRequired(label: string) {
  return (value: string): string | undefined => (value.trim() ? undefined : `${label} is required`)
}
