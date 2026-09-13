import { Link, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/error'
import { useVerifyEmail } from '../hooks/useVerifyEmail'
import { AuthShell } from '../auth/AuthUI'

export function VerifyEmailPage() {
  const { token } = useSearch({ from: '/verify-email' })
  const { mutateAsync: verifyEmail } = useVerifyEmail()
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    token ? null : { ok: false, message: 'This verification link is missing a token.' },
  )
  // Verification tokens are single-use, so this request must fire at most
  // once per token even though React 18/19 StrictMode intentionally runs
  // effects twice in development. A ref survives that double-invoke (it
  // does not remount the component), unlike a variable local to the effect
  // closure — see the git history of this file for what went wrong without
  // it: the first (successful) call's own cleanup had already flipped its
  // closure's `cancelled` flag by the time it resolved, so its success was
  // discarded, and the second call's "token already used" failure won.
  const startedForToken = useRef<string | null>(null)

  useEffect(() => {
    if (!token || startedForToken.current === token) {
      return
    }
    startedForToken.current = token
    verifyEmail(token)
      .then(() => {
        setResult({ ok: true, message: 'Email verified. You can sign in now.' })
      })
      .catch((err: unknown) => {
        setResult({
          ok: false,
          message: err instanceof ApiError ? err.message : 'Verification failed',
        })
      })
  }, [token, verifyEmail])

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
