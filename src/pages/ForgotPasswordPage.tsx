import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ApiError, forgotPassword } from '../lib/api'
import { AuthLinks, AuthShell } from '../auth/AuthUI'
import { preventSubmit } from '../lib/form'

export function ForgotPasswordPage() {
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await forgotPassword(value.email)
        toast.success('If that account exists, a reset email is on the way')
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Request failed')
      }
    },
  })

  return (
    <AuthShell title="Reset password" lead="We will email a reset link if the address is registered.">
      {error ? <p className="auth-error">{error}</p> : null}
      <form onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="email">
          {(field) => (
            <label className="auth-field" htmlFor="forgot-email">
              <span>Email</span>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>
        <button className="auth-submit" type="submit">
          Send reset link
        </button>
      </form>
      <AuthLinks left={{ to: '/login', label: 'Back to sign in' }} />
    </AuthShell>
  )
}
