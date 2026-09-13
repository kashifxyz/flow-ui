import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ApiError, register } from '../lib/api'
import { AuthLinks, AuthShell, PasswordField } from '../auth/AuthUI'
import { preventSubmit } from '../lib/form'

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: { display_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await register({
          email: value.email,
          password: value.password,
          display_name: value.display_name,
        })
        toast.success('Check your email to verify your account')
        await navigate({ to: '/login' })
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not create account')
      }
    },
  })

  return (
    <AuthShell title="Create account" lead="Flow uses email and password only. Verify the address before signing in.">
      {error ? <p className="auth-error">{error}</p> : null}
      <form onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="display_name">
          {(field) => (
            <label className="auth-field" htmlFor="register-name">
              <span>Name</span>
              <input
                id="register-name"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <label className="auth-field" htmlFor="register-email">
              <span>Email</span>
              <input
                id="register-email"
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
              id="register-password"
              label="Password"
              autoComplete="new-password"
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
        <button className="auth-submit" type="submit">
          Create account
        </button>
      </form>
      <AuthLinks left={{ to: '/login', label: 'Already have an account' }} />
    </AuthShell>
  )
}
