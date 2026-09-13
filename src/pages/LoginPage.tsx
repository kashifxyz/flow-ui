import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { notifySuccess, notifyError } from '../lib/toast'
import { ApiError } from '../api/error'
import { useLogin } from '../hooks/useLogin'
import { useResendVerification } from '../hooks/useResendVerification'
import { AuthLinks, AuthShell, PasswordField } from '../auth/AuthUI'
import { preventSubmit } from '../lib/form'
import { validateEmail, validateRequired } from '../lib/validation'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const resendVerification = useResendVerification()
  const [unverifiedEmail, setUnverifiedEmail] = useState('')

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setUnverifiedEmail('')
      try {
        await login.mutateAsync({ email: value.email, password: value.password })
        notifySuccess('Signed in')
        await navigate({ to: '/app' })
      } catch (err) {
        if (err instanceof ApiError && err.code === 'email_unverified') {
          setUnverifiedEmail(value.email)
        }
        notifyError(err instanceof ApiError ? err.message : 'Sign in failed')
      }
    },
  })

  return (
    <AuthShell title="Sign in" lead="Use your email and password to continue.">
      <form onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="email" validators={{ onChange: ({ value }) => validateEmail(value) }}>
          {(field) => (
            <label className="auth-field" htmlFor="login-email">
              <span>Email</span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <p className="field-error">{field.state.meta.errors.join(', ')}</p>
              ) : null}
            </label>
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => validateRequired('Password')(value) }}>
          {(field) => (
            <PasswordField
              id="login-password"
              label="Password"
              autoComplete="current-password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') : undefined}
            />
          )}
        </form.Field>
        {unverifiedEmail ? (
          <button
            type="button"
            className="auth-submit secondary"
            onClick={async () => {
              try {
                await resendVerification.mutateAsync(unverifiedEmail)
                notifySuccess('Verification email sent')
              } catch (err) {
                notifyError(err instanceof ApiError ? err.message : 'Could not resend')
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
