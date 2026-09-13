import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ApiError, login, resendVerification } from '../lib/api'
import { queryClient } from '../lib/query'
import { meQueryKey } from '../auth/useMe'
import { AuthLinks, AuthShell, PasswordField } from '../auth/AuthUI'
import { preventSubmit } from '../lib/form'

export function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState('')

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      setUnverifiedEmail('')
      try {
        const user = await login({ email: value.email, password: value.password })
        queryClient.setQueryData(meQueryKey, user)
        toast.success('Signed in')
        await navigate({ to: '/app' })
      } catch (err) {
        if (err instanceof ApiError && err.code === 'email_unverified') {
          setUnverifiedEmail(value.email)
        }
        setError(err instanceof ApiError ? err.message : 'Sign in failed')
      }
    },
  })

  return (
    <AuthShell title="Sign in" lead="Use your email and password to continue.">
      {error ? <p className="auth-error">{error}</p> : null}
      <form onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="email">
          {(field) => (
            <label className="auth-field" htmlFor="login-email">
              <span>Email</span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <PasswordField
              id="login-password"
              label="Password"
              autoComplete="current-password"
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
        {unverifiedEmail ? (
          <button
            type="button"
            className="auth-submit secondary"
            onClick={async () => {
              try {
                await resendVerification(unverifiedEmail)
                toast.success('Verification email sent')
              } catch (err) {
                toast.error(err instanceof ApiError ? err.message : 'Could not resend')
              }
            }}
          >
            Resend verification email
          </button>
        ) : null}
        <button className="auth-submit" type="submit">
          Sign in
        </button>
      </form>
      <AuthLinks
        left={{ to: '/register', label: 'Create account' }}
        right={{ to: '/forgot-password', label: 'Forgot password' }}
      />
    </AuthShell>
  )
}
