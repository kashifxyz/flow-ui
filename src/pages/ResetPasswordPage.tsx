import { useForm } from '@tanstack/react-form'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ApiError, resetPassword } from '../lib/api'
import { AuthLinks, AuthShell, PasswordField } from '../auth/AuthUI'
import { preventSubmit } from '../lib/form'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/reset-password' })
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: { password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await resetPassword(token, value.password)
        toast.success('Password updated. Sign in with the new password.')
        await navigate({ to: '/login' })
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Reset failed')
      }
    },
  })

  return (
    <AuthShell title="Choose a new password" lead="Use at least 10 characters. Previous sessions will be signed out.">
      {error ? <p className="auth-error">{error}</p> : null}
      {!token ? <p className="auth-error">This reset link is missing a token.</p> : null}
      <form onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="password">
          {(field) => (
            <PasswordField
              id="reset-password"
              label="New password"
              autoComplete="new-password"
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
        <button className="auth-submit" type="submit" disabled={!token}>
          Update password
        </button>
      </form>
      <AuthLinks left={{ to: '/login', label: 'Back to sign in' }} />
    </AuthShell>
  )
}
