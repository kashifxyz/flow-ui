import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { notifySuccess, notifyError } from '../lib/toast'
import { ApiError } from '../api/error'
import { useRegister } from '../hooks/useRegister'
import { AuthLinks, AuthShell, PasswordField } from '../auth/AuthUI'
import { preventSubmit } from '../lib/form'
import { validateEmail, validateNewPassword } from '../lib/validation'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()

  const form = useForm({
    defaultValues: { display_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      try {
        await register.mutateAsync({
          email: value.email,
          password: value.password,
          display_name: value.display_name,
        })
        notifySuccess('Check your email to verify your account')
        await navigate({ to: '/login' })
      } catch (err) {
        notifyError(err instanceof ApiError ? err.message : 'Could not create account')
      }
    },
  })

  return (
    <AuthShell title="Create account" lead="Flow uses email and password only. Verify the address before signing in.">
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
        <form.Field name="email" validators={{ onChange: ({ value }) => validateEmail(value) }}>
          {(field) => (
            <label className="auth-field" htmlFor="register-email">
              <span>Email</span>
              <input
                id="register-email"
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
        <form.Field name="password" validators={{ onChange: ({ value }) => validateNewPassword(value) }}>
          {(field) => (
            <PasswordField
              id="register-password"
              label="Password"
              autoComplete="new-password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') : undefined}
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
