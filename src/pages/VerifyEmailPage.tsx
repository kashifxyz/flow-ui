import { Link, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ApiError, verifyEmail } from '../lib/api'
import { AuthShell } from '../auth/AuthUI'

export function VerifyEmailPage() {
  const { token } = useSearch({ from: '/verify-email' })
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    token ? null : { ok: false, message: 'This verification link is missing a token.' },
  )

  useEffect(() => {
    if (!token) {
      return
    }
    let cancelled = false
    verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setResult({ ok: true, message: 'Email verified. You can sign in now.' })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            ok: false,
            message: err instanceof ApiError ? err.message : 'Verification failed',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const working = token !== '' && result === null
  const message = result?.message ?? 'Verifying your email…'
  const isError = result !== null && !result.ok

  return (
    <AuthShell title="Verify email" lead="Confirm the address on this account.">
      <p className={isError ? 'auth-error' : 'lead'}>{message}</p>
      {!working ? (
        <div className="auth-links">
          <Link to="/login">Go to sign in</Link>
        </div>
      ) : null}
    </AuthShell>
  )
}
